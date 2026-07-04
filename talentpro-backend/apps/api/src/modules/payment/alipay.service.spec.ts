import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AlipayService } from './alipay.service';
import { PrismaService } from '@/common/prisma/prisma.service';
import { PaymentProvider, PaymentStatus } from '@prisma/client';

describe('AlipayService', () => {
  let service: AlipayService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlipayService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const map: Record<string, unknown> = {
                'app.frontendUrl': 'http://localhost:3000',
                ALIPAY_APP_ID: '',
                ALIPAY_PRIVATE_KEY: '',
                ALIPAY_PUBLIC_KEY: '',
                ALIPAY_GATEWAY: 'https://openapi.alipay.com/gateway.do',
                ALIPAY_SANDBOX: 'false',
                ALIPAY_MOCK: 'false',
              };
              return map[key] ?? undefined;
            }),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            order: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            subscription: {
              update: jest.fn(),
            },
            $transaction: jest.fn((ops) => Promise.all(ops)),
          },
        },
      ],
    }).compile();

    service = module.get<AlipayService>(AlipayService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('prepareOrder', () => {
    it('should return mock payment url when keys are missing', async () => {
      jest.spyOn(prisma.order, 'findUnique').mockResolvedValue({
        id: 'o1',
        orderNo: 'TP20240101ABC',
        status: PaymentStatus.PENDING,
        total: 299,
      } as never);
      jest.spyOn(prisma.order, 'update').mockResolvedValue({ id: 'o1' } as never);

      const result = await service.prepareOrder('o1');

      expect(result.orderId).toBe('o1');
      expect(result.paymentUrl).toBe('http://localhost:3000/marketplace/payment/alipay-mock?order_id=o1');
      expect(result.providerPaymentId).toBe('alipay_mock_o1');
      expect(prisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { provider: PaymentProvider.ALIPAY, providerPaymentId: 'alipay_mock_o1' },
        }),
      );
    });

    it('should throw when order status is not pending', async () => {
      jest.spyOn(prisma.order, 'findUnique').mockResolvedValue({
        id: 'o1',
        status: PaymentStatus.COMPLETED,
      } as never);

      await expect(service.prepareOrder('o1')).rejects.toThrow('Order status does not allow payment');
    });
  });

  describe('handleNotify', () => {
    it('should accept mock payment notify', async () => {
      const result = await service.handleNotify({
        trade_status: 'TRADE_SUCCESS',
        out_trade_no: 'alipay_mock_o1',
      });

      expect(result.verified).toBe(true);
      expect(result.providerPaymentId).toBe('alipay_mock_o1');
    });

    it('should reject invalid mock notify', async () => {
      const result = await service.handleNotify({ trade_status: 'WAIT_BUYER_PAY' });

      expect(result.verified).toBe(false);
    });
  });

  describe('verifyMockPayment', () => {
    it('should mark mock alipay order as completed', async () => {
      jest.spyOn(prisma.order, 'findUnique').mockResolvedValue({
        id: 'o1',
        status: PaymentStatus.PENDING,
        provider: PaymentProvider.ALIPAY,
        providerPaymentId: 'alipay_mock_o1',
        subscriptionId: 'sub-1',
        subscription: { interval: 'month' },
      } as never);
      jest.spyOn(prisma.order, 'update').mockResolvedValue({ id: 'o1', status: PaymentStatus.COMPLETED } as never);
      jest.spyOn(prisma.subscription, 'update').mockResolvedValue({ id: 'sub-1' } as never);

      const result = await service.verifyMockPayment('o1');

      expect(result.status).toBe(PaymentStatus.COMPLETED);
      expect(prisma.subscription.update).toHaveBeenCalled();
    });

    it('should throw for non-alipay order', async () => {
      jest.spyOn(prisma.order, 'findUnique').mockResolvedValue({
        id: 'o1',
        provider: PaymentProvider.STRIPE,
      } as never);

      await expect(service.verifyMockPayment('o1')).rejects.toThrow('Order is not an Alipay order');
    });

    it('should throw for non-mock alipay order', async () => {
      jest.spyOn(prisma.order, 'findUnique').mockResolvedValue({
        id: 'o1',
        provider: PaymentProvider.ALIPAY,
        providerPaymentId: 'alipay_real_o1',
      } as never);

      await expect(service.verifyMockPayment('o1')).rejects.toThrow('Only Alipay mock orders can be verified');
    });
  });
});
