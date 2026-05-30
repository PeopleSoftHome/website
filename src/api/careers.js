import { apiClient } from './client.js';

export const careersApi = {
  getJobs: (params) => apiClient.get('/careers', { params }),
  getJob: (id) => apiClient.get(`/careers/${id}`),
  getDepartments: () => apiClient.get('/careers/departments'),
  applyJob: (id, data) => apiClient.post(`/careers/${id}/apply`, data),
};
