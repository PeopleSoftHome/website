import { apiClient as client } from './client.js';

export const forumApi = {
  getCategories: () => client.get('/forums/categories'),
  getTopics: (params) => client.get('/forums/topics', { params }),
  getTopic: (id) => client.get(`/forums/topics/${id}`),
  createPost: (data) => client.post('/forums/posts', data),
};
