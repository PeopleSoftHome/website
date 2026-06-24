import { apiClient } from './client';

export const systemApi = {
  getPublicConfig() {
    return apiClient.get('/system/config/public', { silent: true });
  },
};
