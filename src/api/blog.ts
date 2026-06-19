import { apiClient as client } from './client.js';

export const blogApi = {
  getCategories: () => client.get('/blogs/categories'),
  getPosts: (params) => client.get('/blogs/posts', { params }),
  getPost: (slug) => client.get(`/blogs/posts/${slug}`),
  getTags: () => client.get('/blogs/tags'),
};
