import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { CreateOrderDto, CreateStripeCheckoutDto } from './dto/create-order.dto';
import { CheckoutCartDto } from './dto/checkout-cart.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

describe('PaymentController', () => {
  let controller: PaymentController;
  let service: PaymentService;

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
            createStripeCheckout: jest.fn(),
            handleStripeWebhook: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
    service = module.get<PaymentService>(PaymentService);
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
});
