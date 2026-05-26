import { apiClient } from './client.js';

export const forumApi = {
  getCategories() {
    return apiClient.get('/forums/categories').then((r) => r.data);
  },

  getTopics(params) {
    return apiClient.get('/forums/topics', { params }).then((r) => r.data);
  },

  getTopicById(id) {
    return apiClient.get(`/forums/topics/${id}`).then((r) => r.data);
  },

  createTopic(data) {
    return apiClient.post('/forums/topics', data).then((r) => r.data);
  },

  createPost(data) {
    return apiClient.post('/forums/posts', data).then((r) => r.data);
  },
};
