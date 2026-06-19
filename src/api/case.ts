import { apiClient } from './client.js';
import type { AxiosResponse } from 'axios';

export type CaseListParams = Record<string, unknown>;

export const caseApi = {
  getCases: (params: CaseListParams): Promise<AxiosResponse> =>
    apiClient.get('/cases', { params }),
  getCase: (slug: string): Promise<AxiosResponse> =>
    apiClient.get(`/cases/${slug}`),
  getIndustries: (): Promise<AxiosResponse> =>
    apiClient.get('/cases/industries'),
};
