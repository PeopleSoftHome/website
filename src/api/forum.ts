import { apiClient as client } from './client';
import type { AxiosResponse } from 'axios';

export type TopicListParams = Record<string, unknown>;
export type ForumPostData = Record<string, unknown>;

export const forumApi = {
  getCategories: (): Promise<AxiosResponse> =>
    client.get('/forums/categories'),
  getTopics: (params: TopicListParams): Promise<AxiosResponse> =>
    client.get('/forums/topics', { params }),
  getTopic: (id: string | number): Promise<AxiosResponse> =>
    client.get(`/forums/topics/${id}`),
  createPost: (data: ForumPostData): Promise<AxiosResponse> =>
    client.post('/forums/posts', data),
};
