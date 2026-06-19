import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentStatus, App, Order } from '@prisma/client';
import { PaymentService } from './payment.service';
import { PrismaService } from '@/common/prisma/prisma.service';

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
            },
            subscription: {
              create: jest.fn(),
              findUnique: jest.fn(),
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

  describe('createStripeCheckout', () => {
    it('should throw BadRequestException when Stripe is not configured', async () => {
      await expect(service.createStripeCheckout('o1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('handleStripeWebhook', () => {
    it('should return received false when Stripe is not configured', async () => {
      const result = await service.handleStripeWebhook('sig', Buffer.from('{}'));
      expect(result.received).toBe(false);
    });
  });
});
