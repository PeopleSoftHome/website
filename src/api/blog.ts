import { apiClient as client } from './client.js';
import type { AxiosResponse } from 'axios';

export type BlogListParams = Record<string, unknown>;

export const blogApi = {
  getCategories: (): Promise<AxiosResponse> => client.get('/blogs/categories'),
  getPosts: (params: BlogListParams): Promise<AxiosResponse> =>
    client.get('/blogs/posts', { params }),
  getPost: (slug: string | string[] | undefined): Promise<AxiosResponse> =>
    client.get(`/blogs/posts/${slug}`),
  getTags: (): Promise<AxiosResponse> => client.get('/blogs/tags'),
};
