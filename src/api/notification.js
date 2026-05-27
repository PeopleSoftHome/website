import { apiClient } from './client.js';

export const notificationApi = {
  getNotifications(page = 1, pageSize = 20) {
    return apiClient.get('/notifications', { params: { page, pageSize } });
  },

  markAsRead(id) {
    return apiClient.patch(`/notifications/${id}/read`);
  },

  markAllAsRead() {
    return apiClient.patch('/notifications/read-all');
  },

  createEventSource(token) {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
    // SSE 标准 EventSource 不支持自定义 headers，通过 query parameter 传递 token
    const url = `${baseUrl}/notifications/stream?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);
    return es;
  },
};
