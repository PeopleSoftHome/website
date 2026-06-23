import { apiClient } from './client';
import { ENDPOINTS } from '@/constants/endpoints';
import type { AxiosResponse } from 'axios';

export type BookingData = Record<string, unknown>;

export const leadApi = {
  createBooking(data: BookingData): Promise<AxiosResponse> {
    return apiClient.post(ENDPOINTS.DEMO_BOOKINGS, data);
  },
};
