import { apiClient } from './client.js';
import { SEARCH_LIMIT } from '@/constants/pagination.js';

export const searchApi = {
  search(q, type, limit = SEARCH_LIMIT) {
    return apiClient.get('/search', { params: { q, type, limit } });
  },

  getSuggestions(q) {
    return apiClient.get('/search/suggestions', { params: { q } });
  },
};
