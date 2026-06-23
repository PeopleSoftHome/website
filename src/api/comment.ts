import { apiClient } from './client';
import type { AxiosResponse } from 'axios';

export type CommentData = Record<string, unknown>;

export const commentApi = {
  getComments(
    entityType: string,
    entityId: string | number,
    page = 1,
    pageSize = 20,
  ): Promise<AxiosResponse> {
    return apiClient.get('/blogs/comments', {
      params: { entityType, entityId, page, pageSize },
    });
  },

  createComment(data: CommentData): Promise<AxiosResponse> {
    return apiClient.post('/blogs/comments', data);
  },
};
