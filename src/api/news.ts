import { apiClient } from './client';
import type { AxiosResponse } from 'axios';

export type NewsListParams = Record<string, unknown>;

export const newsApi = {
  getNews: (params: NewsListParams): Promise<AxiosResponse> =>
    apiClient.get('/news', { params }),
  getNewsItem: (slug: string): Promise<AxiosResponse> =>
    apiClient.get(`/news/${slug}`),
  getCategories: (): Promise<AxiosResponse> =>
    apiClient.get('/news/categories'),
};
