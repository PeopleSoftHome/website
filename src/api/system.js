import { apiClient } from './client.js';

export const systemApi = {
  getPublicConfig() {
    return apiClient.get('/system/config/public', { silent: true });
  },
};
