import { apiClient } from './client';
import type { AxiosResponse } from 'axios';

export type AppListParams = Record<string, unknown>;
export type ReviewData = Record<string, unknown>;
export type OrderData = Record<string, unknown>;
export type CheckoutData = Record<string, unknown>;
export type CartItemData = Record<string, unknown>;

export const marketplaceApi = {
  getApps: (params: AppListParams): Promise<AxiosResponse> =>
    apiClient.get('/marketplace/apps', { params }),
  getApp: (slug: string): Promise<AxiosResponse> =>
    apiClient.get(`/marketplace/apps/${slug}`),
  getFeaturedApps: (): Promise<AxiosResponse> =>
    apiClient.get('/marketplace/apps/featured'),
  getCategories: (): Promise<AxiosResponse> =>
    apiClient.get('/marketplace/categories'),
  getReviews: (slug: string, params: AppListParams): Promise<AxiosResponse> =>
    apiClient.get(`/marketplace/apps/${slug}/reviews`, { params }),
  createReview: (slug: string, data: ReviewData): Promise<AxiosResponse> =>
    apiClient.post(`/marketplace/apps/${slug}/reviews`, data),
  installApp: (slug: string | undefined): Promise<AxiosResponse> =>
    apiClient.post(`/marketplace/apps/${slug}/install`),
  getMyApps: (): Promise<AxiosResponse> =>
    apiClient.get('/marketplace/workspace/apps'),
  getMySubscriptions: (): Promise<AxiosResponse> =>
    apiClient.get('/marketplace/workspace/subscriptions'),
};

export const paymentApi = {
  createOrder: (data: OrderData): Promise<AxiosResponse> =>
    apiClient.post('/payments/orders', data),
  checkoutCart: (data: { items: CartItemData[] }): Promise<AxiosResponse> =>
    apiClient.post('/payments/cart/checkout', data),
  getOrders: (params: AppListParams): Promise<AxiosResponse> =>
    apiClient.get('/payments/orders', { params }),
  getOrder: (id: string | number | undefined | null): Promise<AxiosResponse> =>
    apiClient.get(`/payments/orders/${id}`),
  createStripeCheckout: (data: CheckoutData): Promise<AxiosResponse> =>
    apiClient.post('/payments/stripe/checkout', data),
};

export const cartApi = {
  getCart: (): Promise<AxiosResponse> => apiClient.get('/cart'),
  addItem: (data: CartItemData): Promise<AxiosResponse> =>
    apiClient.post('/cart/items', data),
  updateItem: (appId: string, tierName: string, quantity: number): Promise<AxiosResponse> =>
    apiClient.post(`/cart/items/${appId}?tier=${tierName}`, { quantity }),
  removeItem: (appId: string, tierName: string): Promise<AxiosResponse> =>
    apiClient.delete(`/cart/items/${appId}?tier=${tierName}`),
  clearCart: (): Promise<AxiosResponse> => apiClient.delete('/cart'),
};
