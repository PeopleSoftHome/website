import { apiClient } from './client.js';

export const blogApi = {
  getCategories() {
    return apiClient.get('/blogs/categories').then((r) => r.data);
  },

  getPosts(params) {
    return apiClient.get('/blogs/posts', { params }).then((r) => r.data);
  },

  getPostBySlug(slug) {
    return apiClient.get(`/blogs/posts/${slug}`).then((r) => r.data);
  },

  getTags() {
    return apiClient.get('/blogs/tags').then((r) => r.data);
  },

  createComment(data) {
    return apiClient.post('/blogs/comments', data).then((r) => r.data);
  },
};
