import { apiClient } from './client.js';

export const cmsApi = {
  // Products
  getProducts() {
    return apiClient.get('/cms/products').then((r) => r.data);
  },

  // Industries
  getIndustries() {
    return apiClient.get('/cms/industries').then((r) => r.data);
  },

  // Testimonials
  getTestimonials() {
    return apiClient.get('/cms/testimonials').then((r) => r.data);
  },

  // Resources
  getResources(params) {
    return apiClient.get('/cms/resources', { params }).then((r) => r.data);
  },

  // Navigation
  getNavigation(key = 'header') {
    return apiClient.get(`/cms/navigations/${key}`).then((r) => r.data);
  },

  // Stats
  getStats() {
    return apiClient.get('/cms/stats').then((r) => r.data);
  },

  // Logos
  getLogos() {
    return apiClient.get('/cms/logos').then((r) => r.data);
  },

  // WhyUs
  getWhyUs() {
    return apiClient.get('/cms/why-us').then((r) => r.data);
  },

  // AI Cards
  getAiCards() {
    return apiClient.get('/cms/ai-cards').then((r) => r.data);
  },

  // Page (首页配置)
  getPage(slug = 'home') {
    return apiClient.get(`/cms/pages/${slug}`).then((r) => r.data);
  },

  // Translations
  getTranslations(locale, context) {
    return apiClient.get('/cms/translations', { params: { locale, context } }).then((r) => r.data);
  },
};
