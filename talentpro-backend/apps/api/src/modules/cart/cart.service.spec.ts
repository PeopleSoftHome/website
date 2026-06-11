import { Test, TestingModule } from '@nestjs/testing';
import { CartService, CartItem } from './cart.service';
import { REDIS_CLIENT } from '@/common/redis/redis.module';

describe('CartService', () => {
  let service: CartService;
  let redisMock: { get: jest.Mock; setex: jest.Mock; del: jest.Mock };

  beforeEach(async () => {
    redisMock = {
      get: jest.fn(),
      setex: jest.fn().mockResolvedValue('OK'),
      del: jest.fn().mockResolvedValue(1),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: REDIS_CLIENT,
          useValue: redisMock,
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCart', () => {
    it('should return empty cart when redis has no data', async () => {
      redisMock.get.mockResolvedValue(null);

      const result = await service.getCart('user-1');

      expect(redisMock.get).toHaveBeenCalledWith('cart:user-1');
      expect(result.items).toEqual([]);
      expect(result.updatedAt).toBeDefined();
    });

    it('should return parsed cart when redis has data', async () => {
      const cart = {
        items: [{ appId: 'app-1', slug: 'test-app', name: 'Test', tierName: 'pro', price: 100, currency: 'CNY', quantity: 2, addedAt: '2024-01-01' }],
        updatedAt: '2024-01-01',
      };
      redisMock.get.mockResolvedValue(JSON.stringify(cart));

      const result = await service.getCart('user-1');

      expect(result.items).toHaveLength(1);
      expect(result.items[0].appId).toBe('app-1');
    });
  });

  describe('addItem', () => {
    it('should add new item to empty cart', async () => {
      redisMock.get.mockResolvedValue(null);

      const item = { appId: 'app-1', slug: 'test', name: 'Test App', tierName: 'pro', price: 299 };
      const result = await service.addItem('user-1', item);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].quantity).toBe(1);
      expect(result.items[0].currency).toBe('CNY');
      expect(redisMock.setex).toHaveBeenCalledWith(
        'cart:user-1',
        7 * 24 * 60 * 60,
        expect.any(String),
      );
    });

    it('should increment quantity for existing item', async () => {
      const existingCart = {
        items: [{ appId: 'app-1', slug: 'test', name: 'Test', tierName: 'pro', price: 299, currency: 'CNY', quantity: 1, addedAt: '2024-01-01' }],
        updatedAt: '2024-01-01',
      };
      redisMock.get.mockResolvedValue(JSON.stringify(existingCart));

      const item = { appId: 'app-1', slug: 'test', name: 'Test', tierName: 'pro', price: 299, quantity: 2 };
      const result = await service.addItem('user-1', item);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].quantity).toBe(3);
    });
  });

  describe('updateItem', () => {
    it('should update quantity of existing item', async () => {
      const existingCart = {
        items: [{ appId: 'app-1', slug: 'test', name: 'Test', tierName: 'pro', price: 299, currency: 'CNY', quantity: 1, addedAt: '2024-01-01' }],
        updatedAt: '2024-01-01',
      };
      redisMock.get.mockResolvedValue(JSON.stringify(existingCart));

      const result = await service.updateItem('user-1', 'app-1', 'pro', 5);

      expect(result.items[0].quantity).toBe(5);
    });

    it('should remove item when quantity <= 0', async () => {
      const existingCart = {
        items: [{ appId: 'app-1', slug: 'test', name: 'Test', tierName: 'pro', price: 299, currency: 'CNY', quantity: 1, addedAt: '2024-01-01' }],
        updatedAt: '2024-01-01',
      };
      redisMock.get.mockResolvedValue(JSON.stringify(existingCart));

      const result = await service.updateItem('user-1', 'app-1', 'pro', 0);

      expect(result.items).toHaveLength(0);
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', async () => {
      const existingCart = {
        items: [
          { appId: 'app-1', slug: 'test', name: 'Test', tierName: 'pro', price: 299, currency: 'CNY', quantity: 1, addedAt: '2024-01-01' },
          { appId: 'app-2', slug: 'test2', name: 'Test2', tierName: 'basic', price: 99, currency: 'CNY', quantity: 1, addedAt: '2024-01-01' },
        ],
        updatedAt: '2024-01-01',
      };
      redisMock.get.mockResolvedValue(JSON.stringify(existingCart));

      const result = await service.removeItem('user-1', 'app-1', 'pro');

      expect(result.items).toHaveLength(1);
      expect(result.items[0].appId).toBe('app-2');
    });
  });

  describe('clearCart', () => {
    it('should delete cart from redis', async () => {
      await service.clearCart('user-1');
      expect(redisMock.del).toHaveBeenCalledWith('cart:user-1');
    });
  });
});
