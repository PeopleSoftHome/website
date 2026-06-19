import { apiClient } from './client.js';
import type { AxiosResponse } from 'axios';

export type JobListParams = Record<string, unknown>;
export type JobApplicationData = Record<string, unknown>;

export const careersApi = {
  getJobs: (params: JobListParams): Promise<AxiosResponse> =>
    apiClient.get('/careers', { params }),
  getJob: (id: string | number): Promise<AxiosResponse> =>
    apiClient.get(`/careers/${id}`),
  getDepartments: (): Promise<AxiosResponse> =>
    apiClient.get('/careers/departments'),
  applyJob: (id: string | number, data: JobApplicationData): Promise<AxiosResponse> =>
    apiClient.post(`/careers/${id}/apply`, data),
};
