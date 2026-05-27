import { apiClient } from './client.js';

export const aiApi = {
  /**
   * AI 对话（RAG）
   * @param {string} message 用户消息
   * @param {Array<{role:'user'|'assistant'|'system', content:string}>} history 历史消息
   * @returns {Promise<{content:string, sources:string[]}>}
   */
  chat(message, history = []) {
    return apiClient.post('/ai/chat', { message, history });
  },
};
