import { apiClient } from './client';
import type { AxiosResponse } from 'axios';

export type AboutListParams = Record<string, unknown>;

export const aboutApi = {
  getTeam: (params: AboutListParams): Promise<AxiosResponse> =>
    apiClient.get('/about/team', { params }),
  getPartners: (params: AboutListParams): Promise<AxiosResponse> =>
    apiClient.get('/about/partners', { params }),
};
