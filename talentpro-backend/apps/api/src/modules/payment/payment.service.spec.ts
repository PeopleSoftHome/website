import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentStatus, PaymentProvider, App, Order } from '@prisma/client';
import { PaymentService } from './payment.service';
import { PrismaService } from '@shared/prisma/prisma.service';

describe('PaymentService', () => {
  let service: PaymentService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const map: Record<string, unknown> = {
                'app.frontendUrl': 'http://localhost:3000',
                STRIPE_SECRET_KEY: '',
                STRIPE_WEBHOOK_SECRET: '',
              };
              return map[key] ?? undefined;
            }),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            app: {
              findUnique: jest.fn(),
            },
            order: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              updateMany: jest.fn(),
              count: jest.fn(),
              groupBy: jest.fn(),
            },
            subscription: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              updateMany: jest.fn(),
            },
            $transaction: jest.fn((ops) => Promise.all(ops)),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder', () => {
    it('should create a pending order for existing app', async () => {
      jest.spyOn(prisma.app, 'findUnique').mockResolvedValue({
        id: 'a1',
        name: 'Test App',
        pricingModel: 'RECURRING',
        pricingTiers: [{ name: 'pro', price: { month: 299 } }],
      } as unknown as App);
      jest.spyOn(prisma.subscription, 'create').mockResolvedValue({ id: 'sub-1' } as unknown as import('@prisma/client').Subscription);
      jest.spyOn(prisma.order, 'create').mockResolvedValue({
        id: 'o1',
        orderNo: 'TP20240601ABC123',
        status: PaymentStatus.PENDING,
        total: 299,
        currency: 'CNY',
      } as unknown as Order);

      const result = await service.createOrder('user-1', 'ws-1', {
        appId: 'a1',
        tierName: 'pro',
        amount: 299,
      });

      expect(prisma.app.findUnique).toHaveBeenCalledWith({ where: { id: 'a1' } });
      expect(prisma.subscription.create).toHaveBeenCalled();
      expect(prisma.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: PaymentStatus.PENDING,
            total: 299,
            workspaceId: 'ws-1',
            userId: 'user-1',
            currency: 'CNY',
            subscriptionId: 'sub-1',
          }),
        }),
      );
      expect(result.status).toBe(PaymentStatus.PENDING);
    });

    it('should throw BadRequestException when tier does not exist', async () => {
      jest.spyOn(prisma.app, 'findUnique').mockResolvedValue({
        id: 'a1',
        name: 'Test App',
        pricingTiers: [{ name: 'basic', price: 99 }],
      } as unknown as App);

      await expect(
        service.createOrder('user-1', 'ws-1', { appId: 'a1', tierName: 'pro', amount: 299 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when amount mismatches tier price', async () => {
      jest.spyOn(prisma.app, 'findUnique').mockResolvedValue({
        id: 'a1',
        name: 'Test App',
        pricingTiers: [{ name: 'pro', price: { month: 299 } }],
      } as unknown as App);

      await expect(
        service.createOrder('user-1', 'ws-1', { appId: 'a1', tierName: 'pro', amount: 199 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when app does not exist', async () => {
      jest.spyOn(prisma.app, 'findUnique').mockResolvedValue(null);

      await expect(
        service.createOrder('user-1', 'ws-1', { appId: 'not-found', tierName: 'pro', amount: 299 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOrders', () => {
    it('should return paginated orders for workspace and user', async () => {
      const mockOrders = [{ id: 'o1', orderNo: 'ORD-001', status: PaymentStatus.COMPLETED }];
      jest.spyOn(prisma.order, 'findMany').mockResolvedValue(mockOrders as unknown as Order[]);
      jest.spyOn(prisma.order, 'count').mockResolvedValue(1);

      const result = await service.findOrders('user-1', 'ws-1', 1, 20);

      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { workspaceId: 'ws-1', userId: 'user-1' },
          skip: 0,
          take: 20,
        }),
      );
      expect(result.data).toEqual(mockOrders);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOrderById', () => {
    it('should return order when found and belongs to user', async () => {
      const mockOrder = { id: 'o1', orderNo: 'ORD-001', userId: 'user-1' };
      jest.spyOn(prisma.order, 'findFirst').mockResolvedValue(mockOrder as unknown as Order);

      const result = await service.findOrderById('user-1', 'o1');

      expect(result).toEqual(mockOrder);
    });

    it('should throw NotFoundException when order not found', async () => {
      jest.spyOn(prisma.order, 'findFirst').mockResolvedValue(null);

      await expect(service.findOrderById('user-1', 'o-not-found')).rejects.toThrow(NotFoundException);
    });
  });

  describe('cancelOrder', () => {
    it('should cancel a pending order', async () => {
      const order = { id: 'o1', status: PaymentStatus.PENDING };
      jest.spyOn(prisma.order, 'findFirst').mockResolvedValue(order as unknown as Order);
      jest.spyOn(prisma.order, 'update').mockResolvedValue({ ...order, status: PaymentStatus.CANCELLED } as unknown as Order);

      const result = await service.cancelOrder('user-1', 'o1');

      expect(result.status).toBe(PaymentStatus.CANCELLED);
    });

    it('should throw when order is already completed', async () => {
      const order = { id: 'o1', status: PaymentStatus.COMPLETED };
      jest.spyOn(prisma.order, 'findFirst').mockResolvedValue(order as unknown as Order);

      await expect(service.cancelOrder('user-1', 'o1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('state machine', () => {
    it.each([
      [PaymentStatus.PENDING, PaymentStatus.PROCESSING, true],
      [PaymentStatus.PENDING, PaymentStatus.COMPLETED, true],
      [PaymentStatus.PENDING, PaymentStatus.FAILED, true],
      [PaymentStatus.PENDING, PaymentStatus.CANCELLED, true],
      [PaymentStatus.PROCESSING, PaymentStatus.COMPLETED, true],
      [PaymentStatus.PROCESSING, PaymentStatus.FAILED, true],
      [PaymentStatus.COMPLETED, PaymentStatus.REFUNDED, true],
      [PaymentStatus.COMPLETED, PaymentStatus.PARTIALLY_REFUNDED, true],
      [PaymentStatus.PARTIALLY_REFUNDED, PaymentStatus.REFUNDED, true],
      [PaymentStatus.REFUNDED, PaymentStatus.COMPLETED, false],
      [PaymentStatus.FAILED, PaymentStatus.COMPLETED, false],
      [PaymentStatus.PENDING, PaymentStatus.PENDING, false],
    ])('transition %s -> %s should be %s', async (from, to, allowed) => {
      const order = { id: 'o1', status: from };
      jest.spyOn(prisma.order, 'findFirst').mockResolvedValue(order as unknown as Order);
      jest.spyOn(prisma.order, 'findUnique').mockResolvedValue(order as unknown as Order);
      jest.spyOn(prisma.order, 'update').mockResolvedValue({ ...order, status: to } as unknown as Order);

      const fn = async () => service.updateOrderStatus('user-1', 'o1', to);
      if (allowed) {
        await expect(fn()).resolves.toEqual(expect.objectContaining({ status: to }));
      } else {
        await expect(fn()).rejects.toThrow(BadRequestException);
      }
    });
  });

  describe('requestInvoice', () => {
    it('should generate invoiceNo and mark invoiceRequested', async () => {
      const order = { id: 'o1', status: PaymentStatus.COMPLETED, invoiceNo: null };
      jest.spyOn(prisma.order, 'findFirst').mockResolvedValue(order as unknown as Order);
      (prisma.order.update as jest.Mock).mockImplementation((args: { data: Record<string, unknown> }) => {
        return Promise.resolve({ ...order, ...args.data } as unknown as Order);
      });

      const result = await service.requestInvoice('user-1', 'o1', { title: 'TalentPro' });

      expect(result.invoiceRequested).toBe(true);
      expect(result.invoiceNo).toMatch(/^INV-\d{8}-[A-Z0-9]{4}$/);
    });

    it('should throw for pending order', async () => {
      const order = { id: 'o1', status: PaymentStatus.PENDING };
      jest.spyOn(prisma.order, 'findFirst').mockResolvedValue(order as unknown as Order);

      await expect(service.requestInvoice('user-1', 'o1', { title: 'TalentPro' })).rejects.toThrow(BadRequestException);
    });
  });

  describe('admin orders', () => {
    it('findOrdersAdmin should include subscription.app relation', async () => {
      const orders = [{ id: 'o1', subscription: { app: { name: 'App' } } }];
      jest.spyOn(prisma.order, 'findMany').mockResolvedValue(orders as unknown as Order[]);
      jest.spyOn(prisma.order, 'count').mockResolvedValue(1);

      const result = await service.findOrdersAdmin({});

      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: { subscription: { include: { app: true } } },
        }),
      );
      expect(result.meta.total).toBe(1);
    });

    it('getOrderStats should aggregate revenue and counts', async () => {
      jest.spyOn(prisma.order, 'count').mockResolvedValueOnce(10);
      jest.spyOn(prisma.order, 'count').mockResolvedValueOnce(6);
      jest.spyOn(prisma.order, 'count').mockResolvedValueOnce(1);
      jest.spyOn(prisma.order, 'count').mockResolvedValueOnce(2);
      jest.spyOn(prisma.order, 'groupBy').mockResolvedValue([
        { provider: PaymentProvider.STRIPE, _count: { provider: 5 }, _sum: { total: 1000 } },
        { provider: PaymentProvider.ALIPAY, _count: { provider: 1 }, _sum: { total: 200 } },
        { provider: null, _count: { provider: 0 }, _sum: { total: 0 } },
      ] as unknown as ReturnType<PrismaService['order']['groupBy']> extends Promise<infer T> ? T : never);

      const result = await service.getOrderStats();

      expect(result.totalRevenue).toBe(1200);
      expect(result.totalOrders).toBe(10);
      expect(result.completedOrders).toBe(6);
      expect(result.byProvider).toHaveLength(3);
    });

    it('getRevenueAnalytics should include byDay and topApps', async () => {
      jest.spyOn(prisma.order, 'count').mockResolvedValue(0);
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      jest.spyOn(prisma.order, 'groupBy')
        // getOrderStats: byProvider
        .mockResolvedValueOnce([] as never)
        // getRevenueByDay: groupBy paidAt
        .mockResolvedValueOnce([
          { paidAt: now, _sum: { total: 299 }, _count: { id: 1 } },
        ] as never)
        // getRevenueTopApps: groupBy subscriptionId
        .mockResolvedValueOnce([
          { subscriptionId: 'sub-1', _sum: { total: 299 }, _count: { id: 1 } },
        ] as never);
      jest.spyOn(prisma.subscription, 'findMany').mockResolvedValue([
        { id: 'sub-1', app: { id: 'a1', name: 'Test App' } },
      ] as unknown as import('@prisma/client').Subscription[]);

      const result = await service.getRevenueAnalytics(30);

      expect(result.byDay).toEqual([{ date: dateStr, revenue: 299, orders: 1 }]);
      expect(result.topApps).toEqual([{ appId: 'a1', name: 'Test App', revenue: 299, orders: 1 }]);
      expect(prisma.order.findMany).not.toHaveBeenCalled();
    });
  });

  describe('createStripeCheckout', () => {
    it('should throw BadRequestException when Stripe is not configured', async () => {
      await expect(service.createStripeCheckout('o1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('checkoutCart', () => {
    it('should throw BadRequestException when cart is empty', async () => {
      await expect(service.checkoutCart('user-1', 'ws-1', [])).rejects.toThrow(BadRequestException);
    });

    it('should create orders for cart items and throw when Stripe is not configured', async () => {
      jest.spyOn(prisma.app, 'findUnique').mockResolvedValue({
        id: 'a1',
        name: 'Test App',
        pricingModel: 'RECURRING',
        pricingTiers: [{ name: 'pro', price: { month: 299 } }],
      } as unknown as App);
      jest.spyOn(prisma.subscription, 'create').mockResolvedValue({ id: 'sub-1' } as unknown as import('@prisma/client').Subscription);
      jest.spyOn(prisma.order, 'create').mockResolvedValue({
        id: 'o1',
        orderNo: 'TP20240601ABC123',
        status: PaymentStatus.PENDING,
        total: 299,
        currency: 'CNY',
      } as unknown as Order);

      await expect(
        service.checkoutCart('user-1', 'ws-1', [
          { appId: 'a1', tierName: 'pro', amount: 299, currency: 'CNY', quantity: 1, interval: 'month' },
        ]),
      ).rejects.toThrow(BadRequestException);

      expect(prisma.order.create).toHaveBeenCalled();
    });
  });

  describe('findSubscriptions', () => {
    it('should return subscriptions for workspace', async () => {
      const subs = [{ id: 'sub-1', app: { name: 'App' } }];
      jest.spyOn(prisma.subscription, 'findMany').mockResolvedValue(subs as unknown as import('@prisma/client').Subscription[]);

      const result = await service.findSubscriptions('user-1', 'ws-1');

      expect(prisma.subscription.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { workspaceId: 'ws-1' }, include: { app: true } }),
      );
      expect(result).toEqual(subs);
    });
  });

  describe('handleStripeWebhook', () => {
    it('should return received false when Stripe is not configured', async () => {
      const result = await service.handleStripeWebhook('sig', Buffer.from('{}'));
      expect(result.received).toBe(false);
    });
  });
});
