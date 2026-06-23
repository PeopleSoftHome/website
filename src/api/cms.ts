import { apiClient } from './client';
import type { AxiosResponse } from 'axios';

export type CmsListParams = Record<string, unknown>;

export const cmsApi = {
  // Products
  getProducts(): Promise<AxiosResponse> {
    return apiClient.get('/cms/products');
  },
  getProductBySlug(slug: string): Promise<AxiosResponse> {
    return apiClient.get(`/cms/products/${slug}`, { silent: true });
  },

  // Industries
  getIndustries(): Promise<AxiosResponse> {
    return apiClient.get('/cms/industries');
  },
  getIndustryBySlug(slug: string): Promise<AxiosResponse> {
    return apiClient.get(`/cms/industries/${slug}`, { silent: true });
  },

  // Testimonials
  getTestimonials(): Promise<AxiosResponse> {
    return apiClient.get('/cms/testimonials');
  },

  // Resources
  getResources(params: CmsListParams): Promise<AxiosResponse> {
    return apiClient.get('/cms/resources', { params });
  },

  // Navigation
  getNavigation(key = 'header'): Promise<AxiosResponse> {
    return apiClient.get(`/cms/navigations/${key}`);
  },

  // Stats
  getStats(): Promise<AxiosResponse> {
    return apiClient.get('/cms/stats');
  },

  // Logos
  getLogos(): Promise<AxiosResponse> {
    return apiClient.get('/cms/logos');
  },

  // WhyUs
  getWhyUs(): Promise<AxiosResponse> {
    return apiClient.get('/cms/why-us');
  },

  // AI Cards
  getAiCards(): Promise<AxiosResponse> {
    return apiClient.get('/cms/ai-cards');
  },

  // Page (首页配置)
  getPage(slug = 'home'): Promise<AxiosResponse> {
    return apiClient.get(`/cms/pages/${slug}`, { silent: true });
  },

  // Translations
  getTranslations(locale: string, context?: string): Promise<AxiosResponse> {
    return apiClient.get('/cms/translations', { params: { locale, context } });
  },
};
