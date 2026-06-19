import { apiClient } from './client.js';

export const marketplaceApi = {
  getApps: (params) => apiClient.get('/marketplace/apps', { params }),
  getApp: (slug) => apiClient.get(`/marketplace/apps/${slug}`),
  getFeaturedApps: () => apiClient.get('/marketplace/apps/featured'),
  getCategories: () => apiClient.get('/marketplace/categories'),
  getReviews: (slug, params) => apiClient.get(`/marketplace/apps/${slug}/reviews`, { params }),
  createReview: (slug, data) => apiClient.post(`/marketplace/apps/${slug}/reviews`, data),
  installApp: (slug) => apiClient.post(`/marketplace/apps/${slug}/install`),
  getMyApps: () => apiClient.get('/marketplace/workspace/apps'),
  getMySubscriptions: () => apiClient.get('/marketplace/workspace/subscriptions'),
};

export const paymentApi = {
  createOrder: (data) => apiClient.post('/payments/orders', data),
  getOrders: (params) => apiClient.get('/payments/orders', { params }),
  getOrder: (id) => apiClient.get(`/payments/orders/${id}`),
  createStripeCheckout: (data) => apiClient.post('/payments/stripe/checkout', data),
};

export const cartApi = {
  getCart: () => apiClient.get('/cart'),
  addItem: (data) => apiClient.post('/cart/items', data),
  updateItem: (appId, tierName, quantity) => apiClient.post(`/cart/items/${appId}?tier=${tierName}`, { quantity }),
  removeItem: (appId, tierName) => apiClient.delete(`/cart/items/${appId}?tier=${tierName}`),
  clearCart: () => apiClient.delete('/cart'),
};
