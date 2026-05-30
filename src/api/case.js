import { apiClient } from './client.js';

export const caseApi = {
  getCases: (params) => apiClient.get('/cases', { params }),
  getCase: (slug) => apiClient.get(`/cases/${slug}`),
  getIndustries: () => apiClient.get('/cases/industries'),
};
