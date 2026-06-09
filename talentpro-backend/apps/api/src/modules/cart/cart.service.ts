import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '@/common/redis/redis.module';

const CART_TTL = 7 * 24 * 60 * 60; // 7 days

export interface CartItem {
  appId: string;
  slug: string;
  name: string;
  tierName: string;
  price: number;
  currency: string;
  quantity: number;
  addedAt: string;
}

export interface Cart {
  items: CartItem[];
  updatedAt: string;
}

@Injectable()
export class CartService {
  constructor(@Inject(REDIS_CLIENT) private redis: Redis) {}

  private cartKey(userId: string): string {
    return `cart:${userId}`;
  }

  async getCart(userId: string): Promise<Cart> {
    const data = await this.redis.get(this.cartKey(userId));
    if (!data) return { items: [], updatedAt: new Date().toISOString() };
    return JSON.parse(data);
  }

  async addItem(userId: string, item: Partial<CartItem> & { appId: string; slug: string; name: string; tierName: string; price: number }): Promise<Cart> {
    const cart = await this.getCart(userId);
    const existingIndex = cart.items.findIndex((i) => i.appId === item.appId && i.tierName === item.tierName);

    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity += item.quantity || 1;
    } else {
      cart.items.push({
        ...item,
        currency: item.currency || 'CNY',
        quantity: item.quantity || 1,
        addedAt: new Date().toISOString(),
      } as CartItem);
    }

    cart.updatedAt = new Date().toISOString();
    await this.redis.setex(this.cartKey(userId), CART_TTL, JSON.stringify(cart));
    return cart;
  }

  async updateItem(userId: string, appId: string, tierName: string, quantity: number): Promise<Cart> {
    const cart = await this.getCart(userId);
    const index = cart.items.findIndex((i) => i.appId === appId && i.tierName === tierName);
    if (index >= 0) {
      if (quantity <= 0) {
        cart.items.splice(index, 1);
      } else {
        cart.items[index].quantity = quantity;
      }
    }
    cart.updatedAt = new Date().toISOString();
    await this.redis.setex(this.cartKey(userId), CART_TTL, JSON.stringify(cart));
    return cart;
  }

  async removeItem(userId: string, appId: string, tierName: string): Promise<Cart> {
    const cart = await this.getCart(userId);
    cart.items = cart.items.filter((i) => !(i.appId === appId && i.tierName === tierName));
    cart.updatedAt = new Date().toISOString();
    await this.redis.setex(this.cartKey(userId), CART_TTL, JSON.stringify(cart));
    return cart;
  }

  async clearCart(userId: string): Promise<void> {
    await this.redis.del(this.cartKey(userId));
  }
}
