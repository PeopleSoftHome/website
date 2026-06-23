import { apiClient } from './client';
import type { AxiosResponse } from 'axios';

export type ProfileData = Record<string, unknown>;

export const userApi = {
  searchUsers(q: string, limit = 10): Promise<AxiosResponse> {
    return apiClient.get('/users/search', { params: { q, limit } });
  },

  updateProfile(data: ProfileData): Promise<AxiosResponse> {
    return apiClient.patch('/auth/profile', data);
  },
};
