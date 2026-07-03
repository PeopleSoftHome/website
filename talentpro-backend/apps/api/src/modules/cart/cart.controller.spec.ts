import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart-item.dto';

describe('CartController', () => {
  let controller: CartController;
  let service: CartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        {
          provide: CartService,
          useValue: {
            getCart: jest.fn(),
            addItem: jest.fn(),
            updateItem: jest.fn(),
            removeItem: jest.fn(),
            clearCart: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CartController>(CartController);
    service = module.get<CartService>(CartService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /cart', () => {
    it('should return cart for current user', async () => {
      const expected = { items: [], updatedAt: '2024-01-01T00:00:00.000Z' };
      jest.spyOn(service, 'getCart').mockResolvedValue(expected as unknown as ReturnType<CartService['getCart']>);

      const result = await controller.getCart('user-1');

      expect(service.getCart).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(expected);
    });
  });

  describe('POST /cart/items', () => {
    it('should add item to cart', async () => {
      const dto: AddCartItemDto = {
        appId: 'app-1',
        slug: 'test-app',
        name: 'Test App',
        tierName: 'pro',
        price: 299,
        quantity: 2,
      };
      const expected = {
        items: [{ appId: 'app-1', slug: 'test-app', name: 'Test App', tierName: 'pro', price: 299, quantity: 2 }],
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      jest.spyOn(service, 'addItem').mockResolvedValue(expected as unknown as ReturnType<CartService['addItem']>);

      const result = await controller.addItem('user-1', dto);

      expect(service.addItem).toHaveBeenCalledWith('user-1', dto);
      expect(result).toEqual(expected);
    });
  });

  describe('POST /cart/items/:appId', () => {
    it('should update item quantity', async () => {
      const dto: UpdateCartItemDto = { quantity: 5 };
      const expected = {
        items: [{ appId: 'app-1', tierName: 'pro', quantity: 5 }],
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      jest.spyOn(service, 'updateItem').mockResolvedValue(expected as unknown as ReturnType<CartService['updateItem']>);

      const result = await controller.updateItem('user-1', 'app-1', 'pro', dto);

      expect(service.updateItem).toHaveBeenCalledWith('user-1', 'app-1', 'pro', 5);
      expect(result).toEqual(expected);
    });
  });

  describe('DELETE /cart/items/:appId', () => {
    it('should remove item from cart', async () => {
      const expected = { items: [], updatedAt: '2024-01-01T00:00:00.000Z' };
      jest.spyOn(service, 'removeItem').mockResolvedValue(expected as unknown as ReturnType<CartService['removeItem']>);

      const result = await controller.removeItem('user-1', 'app-1', 'pro');

      expect(service.removeItem).toHaveBeenCalledWith('user-1', 'app-1', 'pro');
      expect(result).toEqual(expected);
    });
  });

  describe('DELETE /cart', () => {
    it('should clear cart for current user', async () => {
      jest.spyOn(service, 'clearCart').mockResolvedValue(undefined);

      const result = await controller.clearCart('user-1');

      expect(service.clearCart).toHaveBeenCalledWith('user-1');
      expect(result).toBeUndefined();
    });
  });
});
