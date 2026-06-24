import { apiClient } from './client';
import { ENDPOINTS } from '@/constants/endpoints';
import type { AxiosResponse } from 'axios';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const aiApi = {
  /**
   * AI 对话（RAG）
   * @param message 用户消息
   * @param history 历史消息
   * @returns AI 响应
   */
  chat(message: string, history: ChatMessage[] = []): Promise<AxiosResponse> {
    return apiClient.post(ENDPOINTS.AI_CHAT, { message, history });
  },
};
