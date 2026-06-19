import { apiClient } from './client.js';
import type { AxiosResponse } from 'axios';

export type BookingData = Record<string, unknown>;

export const leadApi = {
  createBooking(data: BookingData): Promise<AxiosResponse> {
    return apiClient.post('/demo-bookings', data);
  },
};
