import { apiClient } from './client.js';

export const cmsApi = {
  // Products
  getProducts() {
    return apiClient.get('/cms/products');
  },
  getProductBySlug(slug) {
    return apiClient.get(`/cms/products/${slug}`, { silent: true });
  },

  // Industries
  getIndustries() {
    return apiClient.get('/cms/industries');
  },
  getIndustryBySlug(slug) {
    return apiClient.get(`/cms/industries/${slug}`, { silent: true });
  },

  // Testimonials
  getTestimonials() {
    return apiClient.get('/cms/testimonials');
  },

  // Resources
  getResources(params) {
    return apiClient.get('/cms/resources', { params });
  },

  // Navigation
  getNavigation(key = 'header') {
    return apiClient.get(`/cms/navigations/${key}`);
  },

  // Stats
  getStats() {
    return apiClient.get('/cms/stats');
  },

  // Logos
  getLogos() {
    return apiClient.get('/cms/logos');
  },

  // WhyUs
  getWhyUs() {
    return apiClient.get('/cms/why-us');
  },

  // AI Cards
  getAiCards() {
    return apiClient.get('/cms/ai-cards');
  },

  // Page (首页配置)
  getPage(slug = 'home') {
    return apiClient.get(`/cms/pages/${slug}`, { silent: true });
  },

  // Translations
  getTranslations(locale, context) {
    return apiClient.get('/cms/translations', { params: { locale, context } });
  },
};
