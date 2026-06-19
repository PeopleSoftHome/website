import { apiClient } from './client.js';

export const userApi = {
  searchUsers(q, limit = 10) {
    return apiClient.get('/users/search', { params: { q, limit } });
  },

  updateProfile(data) {
    return apiClient.patch('/auth/profile', data);
  },
};
