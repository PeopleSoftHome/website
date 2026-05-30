import { apiClient } from './client.js';

export const aboutApi = {
  getTeam: (params) => apiClient.get('/about/team', { params }),
  getPartners: (params) => apiClient.get('/about/partners', { params }),
};
