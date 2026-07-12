import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { AlipayService } from './alipay.service';
import { CreateOrderDto, CreateStripeCheckoutDto } from './dto/create-order.dto';
import { CheckoutCartDto } from './dto/checkout-cart.dto';
import { PaginationDto } from '@shared/dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { InvoiceDto } from './dto/invoice.dto';
import { AlipayPrepareDto } from './dto/alipay-prepare.dto';
import { PaymentStatus } from '@prisma/client';

describe('PaymentController', () => {
  let controller: PaymentController;
  let service: PaymentService;
  let alipayService: AlipayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        {
          provide: PaymentService,
          useValue: {
            createOrder: jest.fn(),
            checkoutCart: jest.fn(),
            findOrders: jest.fn(),
            findOrderById: jest.fn(),
            cancelOrder: jest.fn(),
            requestInvoice: jest.fn(),
            findSubscriptions: jest.fn(),
            createStripeCheckout: jest.fn(),
            handleStripeWebhook: jest.fn(),
            getRevenueAnalytics: jest.fn(),
            findOrdersAdmin: jest.fn(),
            updateOrderStatusAdmin: jest.fn(),
            updateInvoiceAdmin: jest.fn(),
          },
        },
        {
          provide: AlipayService,
          useValue: {
            prepareOrder: jest.fn(),
            handleNotify: jest.fn(),
            verifyMockPayment: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
    service = module.get<PaymentService>(PaymentService);
    alipayService = module.get<AlipayService>(AlipayService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /payments/orders', () => {
    it('should create order with user and workspace', async () => {
      const dto: CreateOrderDto = {
        appId: 'app-1',
        tierName: 'pro',
        amount: 299,
        currency: 'CNY',
      };
      const expected = { id: 'o1', orderNo: 'TP20240101ABC123', status: 'PENDING', total: 299 };
      jest.spyOn(service, 'createOrder').mockResolvedValue(expected as unknown as ReturnType<PaymentService['createOrder']>);

      const result = await controller.createOrder('user-1', { workspaceId: 'ws-1' }, dto);

      expect(service.createOrder).toHaveBeenCalledWith('user-1', 'ws-1', dto);
      expect(result).toEqual(expected);
    });
  });

  describe('POST /payments/cart/checkout', () => {
    it('should checkout cart items', async () => {
      const dto: CheckoutCartDto = {
        items: [
          { appId: 'app-1', tierName: 'pro', amount: 299, currency: 'CNY', quantity: 1 },
        ],
      };
      const expected = {
        orders: [{ id: 'o1', total: 299 }],
        sessionId: 'cs_123',
        url: 'https://checkout.stripe.com/pay/cs_123',
      };
      jest.spyOn(service, 'checkoutCart').mockResolvedValue(expected as unknown as ReturnType<PaymentService['checkoutCart']>);

      const result = await controller.checkoutCart('user-1', { workspaceId: 'ws-1' }, dto);

      expect(service.checkoutCart).toHaveBeenCalledWith('user-1', 'ws-1', dto.items);
      expect(result).toEqual(expected);
    });
  });

  describe('GET /payments/orders', () => {
    it('should return paginated orders', async () => {
      const pagination: PaginationDto = { page: 1, pageSize: 20 };
      const expected = {
        data: [{ id: 'o1', orderNo: 'TP20240101ABC123' }],
        meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
      };
      jest.spyOn(service, 'findOrders').mockResolvedValue(expected as unknown as ReturnType<PaymentService['findOrders']>);

      const result = await controller.findOrders('user-1', { workspaceId: 'ws-1' }, pagination);

      expect(service.findOrders).toHaveBeenCalledWith('user-1', 'ws-1', 1, 20);
      expect(result).toEqual(expected);
    });
  });

  describe('GET /payments/orders/:id', () => {
    it('should return order details', async () => {
      const expected = { id: 'o1', orderNo: 'TP20240101ABC123', total: 299 };
      jest.spyOn(service, 'findOrderById').mockResolvedValue(expected as unknown as ReturnType<PaymentService['findOrderById']>);

      const result = await controller.findOrder('user-1', 'o1');

      expect(service.findOrderById).toHaveBeenCalledWith('user-1', 'o1');
      expect(result).toEqual(expected);
    });
  });

  describe('POST /payments/orders/:id/cancel', () => {
    it('should cancel order', async () => {
      const expected = { id: 'o1', status: PaymentStatus.CANCELLED };
      jest.spyOn(service, 'cancelOrder').mockResolvedValue(expected as unknown as ReturnType<PaymentService['cancelOrder']>);

      const result = await controller.cancelOrder('user-1', 'o1');

      expect(service.cancelOrder).toHaveBeenCalledWith('user-1', 'o1');
      expect(result).toEqual(expected);
    });
  });

  describe('POST /payments/orders/:id/invoice', () => {
    it('should request invoice', async () => {
      const dto: InvoiceDto = { title: 'TalentPro', taxNo: '91111111' };
      const expected = { id: 'o1', invoiceRequested: true, invoiceNo: 'INV-20240101-ABCD' };
      jest.spyOn(service, 'requestInvoice').mockResolvedValue(expected as unknown as ReturnType<PaymentService['requestInvoice']>);

      const result = await controller.requestInvoice('user-1', 'o1', dto);

      expect(service.requestInvoice).toHaveBeenCalledWith('user-1', 'o1', dto);
      expect(result).toEqual(expected);
    });
  });

  describe('GET /payments/subscriptions', () => {
    it('should return subscriptions', async () => {
      const expected = [{ id: 'sub-1', app: { name: 'App' } }];
      jest.spyOn(service, 'findSubscriptions').mockResolvedValue(expected as unknown as ReturnType<PaymentService['findSubscriptions']>);

      const result = await controller.findSubscriptions('user-1', { workspaceId: 'ws-1' });

      expect(service.findSubscriptions).toHaveBeenCalledWith('user-1', 'ws-1');
      expect(result).toEqual(expected);
    });
  });

  describe('POST /payments/stripe/checkout', () => {
    it('should create stripe checkout session', async () => {
      const dto: CreateStripeCheckoutDto = {
        orderId: 'o1',
        successUrl: 'http://localhost:3000/success',
        cancelUrl: 'http://localhost:3000/cancel',
      };
      const expected = { sessionId: 'cs_123', url: 'https://checkout.stripe.com/pay/cs_123' };
      jest.spyOn(service, 'createStripeCheckout').mockResolvedValue(expected as unknown as ReturnType<PaymentService['createStripeCheckout']>);

      const result = await controller.createStripeCheckout(dto);

      expect(service.createStripeCheckout).toHaveBeenCalledWith('o1', 'http://localhost:3000/success', 'http://localhost:3000/cancel');
      expect(result).toEqual(expected);
    });
  });

  describe('POST /payments/stripe/webhook', () => {
    it('should handle stripe webhook', async () => {
      const payload = Buffer.from('{}');
      const expected = { received: true };
      jest.spyOn(service, 'handleStripeWebhook').mockResolvedValue(expected as unknown as ReturnType<PaymentService['handleStripeWebhook']>);

      const result = await controller.handleStripeWebhook('stripe-signature-123', payload);

      expect(service.handleStripeWebhook).toHaveBeenCalledWith('stripe-signature-123', payload);
      expect(result).toEqual(expected);
    });
  });

  describe('POST /payments/alipay/prepare', () => {
    it('should prepare alipay order', async () => {
      const dto: AlipayPrepareDto = { orderId: 'o1' };
      const expected = { orderId: 'o1', paymentUrl: 'http://localhost:3000/marketplace/payment/alipay-mock?order_id=o1', providerPaymentId: 'alipay_mock_o1' };
      jest.spyOn(alipayService, 'prepareOrder').mockResolvedValue(expected as unknown as ReturnType<AlipayService['prepareOrder']>);

      const result = await controller.prepareAlipay(dto);

      expect(alipayService.prepareOrder).toHaveBeenCalledWith('o1');
      expect(result).toEqual(expected);
    });
  });

  describe('POST /payments/alipay/notify', () => {
    it('should handle alipay notify', async () => {
      const payload = { trade_status: 'TRADE_SUCCESS', out_trade_no: 'alipay_mock_o1' };
      const expected = { verified: true, providerPaymentId: 'alipay_mock_o1' };
      jest.spyOn(alipayService, 'handleNotify').mockResolvedValue(expected as never);

      const result = await controller.handleAlipayNotify(payload);

      expect(alipayService.handleNotify).toHaveBeenCalledWith(payload);
      expect(result).toEqual(expected);
    });
  });

  describe('POST /payments/alipay/mock/verify', () => {
    it('should verify mock alipay payment', async () => {
      const expected = { id: 'o1', status: PaymentStatus.COMPLETED };
      jest.spyOn(alipayService, 'verifyMockPayment').mockResolvedValue(expected as unknown as ReturnType<AlipayService['verifyMockPayment']>);

      const result = await controller.verifyAlipayMockPayment('o1');

      expect(alipayService.verifyMockPayment).toHaveBeenCalledWith('o1');
      expect(result).toEqual(expected);
    });
  });

  describe('GET /payments/analytics/revenue', () => {
    it('should return revenue analytics', async () => {
      const expected = { totalRevenue: 1000, totalOrders: 5, byDay: [], topApps: [] };
      jest.spyOn(service, 'getRevenueAnalytics').mockResolvedValue(expected as unknown as ReturnType<PaymentService['getRevenueAnalytics']>);

      const result = await controller.getRevenueAnalytics('30');

      expect(service.getRevenueAnalytics).toHaveBeenCalledWith(30);
      expect(result).toEqual(expected);
    });
  });

  describe('Admin orders', () => {
    it('GET /payments/admin/marketplace/orders should return paginated orders', async () => {
      const pagination: PaginationDto = { page: 1, pageSize: 20 };
      const expected = { data: [{ id: 'o1' }], meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 } };
      jest.spyOn(service, 'findOrdersAdmin').mockResolvedValue(expected as unknown as ReturnType<PaymentService['findOrdersAdmin']>);

      const result = await controller.findOrdersAdmin(pagination);

      expect(service.findOrdersAdmin).toHaveBeenCalledWith({ page: 1, pageSize: 20 });
      expect(result).toEqual(expected);
    });

    it('PATCH /payments/admin/marketplace/orders/:id/status should update status', async () => {
      const dto: UpdateOrderStatusDto = { status: PaymentStatus.COMPLETED, reason: 'manual' };
      const expected = { id: 'o1', status: PaymentStatus.COMPLETED };
      jest.spyOn(service, 'updateOrderStatusAdmin').mockResolvedValue(expected as unknown as ReturnType<PaymentService['updateOrderStatusAdmin']>);

      const result = await controller.updateOrderStatusAdmin('o1', dto);

      expect(service.updateOrderStatusAdmin).toHaveBeenCalledWith('o1', PaymentStatus.COMPLETED, 'manual');
      expect(result).toEqual(expected);
    });

    it('PATCH /payments/admin/marketplace/orders/:id/invoice should update invoice', async () => {
      const dto: InvoiceDto = { title: 'TalentPro' };
      const expected = { id: 'o1', invoiceRequested: true };
      jest.spyOn(service, 'updateInvoiceAdmin').mockResolvedValue(expected as unknown as ReturnType<PaymentService['updateInvoiceAdmin']>);

      const result = await controller.updateInvoiceAdmin('o1', dto);

      expect(service.updateInvoiceAdmin).toHaveBeenCalledWith('o1', dto);
      expect(result).toEqual(expected);
    });
  });
});
