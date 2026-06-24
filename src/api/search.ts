import { apiClient } from './client';
import { SEARCH_LIMIT } from '@/constants/pagination';
import type { AxiosResponse } from 'axios';

export const searchApi = {
  search(q: string, type: string, limit = SEARCH_LIMIT): Promise<AxiosResponse> {
    return apiClient.get('/search', { params: { q, type, limit } });
  },

  getSuggestions(q: string): Promise<AxiosResponse> {
    return apiClient.get('/search/suggestions', { params: { q } });
  },
};
