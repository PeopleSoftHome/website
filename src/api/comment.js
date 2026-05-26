import { apiClient } from './client.js';

export const commentApi = {
  getComments(entityType, entityId, page = 1, pageSize = 20) {
    return apiClient.get('/blogs/comments', {
      params: { entityType, entityId, page, pageSize },
    });
  },

  createComment(data) {
    return apiClient.post('/blogs/comments', data);
  },
};
