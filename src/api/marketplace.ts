import { apiClient } from './client';
import type { AxiosResponse } from 'axios';

export type AppListParams = Record<string, unknown>;
export type ReviewData = Record<string, unknown>;
export type OrderData = Record<string, unknown>;
export type CheckoutData = Record<string, unknown>;
export type CartItemData = Record<string, unknown>;
export type InvoiceData = Record<string, unknown>;
export type AlipayData = Record<string, unknown>;

export interface MarketplaceApp {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  vendor: string;
  icon: string;
  pricingModel: string;
  pricingTiers: { name: string; priceMonthly: number; priceYearly: number; desc: string; features: string[] }[];
  features: string[];
  screenshots: string[];
  compatibility: string[];
  ratingAvg: number;
  ratingCount: number;
  installCount: number;
  featured: boolean;
}

export interface MarketplaceCategory {
  id: string;
  slug: string;
  name: string;
  icon?: string;
  count?: number;
}

export function transformMarketplaceApp(app: any): MarketplaceApp {
  return {
    id: app?.id || '',
    slug: app?.slug || '',
    name: app?.name || '',
    tagline: app?.tagline || '',
    description: app?.description || '',
    category: app?.category?.slug || app?.categoryId || app?.category || '',
    vendor: app?.vendor?.name || app?.vendorId || app?.vendor || '',
    icon: app?.icon || app?.slug || '',
    pricingModel: app?.pricingModel || '',
    pricingTiers: Array.isArray(app?.pricingTiers) ? app.pricingTiers : [],
    features: Array.isArray(app?.features) ? app.features : [],
    screenshots: Array.isArray(app?.screenshots) ? app.screenshots : [],
    compatibility: Array.isArray(app?.compatibility) ? app.compatibility : [],
    ratingAvg: app?.ratingAvg || 0,
    ratingCount: app?.ratingCount || 0,
    installCount: app?.installCount || 0,
    featured: app?.featured || false,
  };
}

export function transformMarketplaceCategory(cat: any): MarketplaceCategory {
  return {
    id: cat?.id || cat?.slug || '',
    slug: cat?.slug || '',
    name: cat?.name || '',
    icon: cat?.icon || '',
    count: cat?._count?.apps ?? cat?.count,
  };
}

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
  getSubscriptions: (): Promise<AxiosResponse> =>
    apiClient.get('/payments/subscriptions'),
  cancelOrder: (id: string | number): Promise<AxiosResponse> =>
    apiClient.post(`/payments/orders/${id}/cancel`),
  requestInvoice: (id: string | number, data: InvoiceData): Promise<AxiosResponse> =>
    apiClient.post(`/payments/orders/${id}/invoice`, data),
  prepareAlipay: (data: AlipayData): Promise<AxiosResponse> =>
    apiClient.post('/payments/alipay/prepare', data),
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
