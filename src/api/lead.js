import { apiClient } from './client.js';

export const leadApi = {
  createBooking(data) {
    return apiClient.post('/demo-bookings', data);
  },
};
