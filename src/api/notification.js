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
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1'}/notifications/stream`;
    const es = new EventSource(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return es;
  },
};
