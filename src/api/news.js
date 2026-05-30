import { apiClient } from './client.js';

export const newsApi = {
  getNews: (params) => apiClient.get('/news', { params }),
  getNewsItem: (slug) => apiClient.get(`/news/${slug}`),
  getCategories: () => apiClient.get('/news/categories'),
};
