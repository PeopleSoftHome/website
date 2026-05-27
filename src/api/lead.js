import { apiClient } from './client.js';

export const leadApi = {
  createBooking(data) {
    return apiClient.post('/demo-bookings', data).then((r) => r.data);
  },
};

// reCAPTCHA v3 site key（从环境变量读取，未配置则跳过）
export const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';
