import { apiClient } from './client.js';

export const searchApi = {
  search(q, type, limit = 20) {
    return apiClient.get('/search', { params: { q, type, limit } }).then((r) => r.data);
  },

  getSuggestions(q) {
    return apiClient.get('/search/suggestions', { params: { q } }).then((r) => r.data);
  },
};
