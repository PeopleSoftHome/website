/**
 * ai 模块
 *
 * 位于: api/ai.ts
 */
import client from './client';

export interface AiGeneratePayload {
  type: string;
  prompt?: string;
  content?: string;
  language?: string;
  tone?: string;
}

export interface AiGenerateImagePayload {
  prompt: string;
  size?: string;
  quality?: string;
  style?: string;
}

export interface AiAdminChatPayload {
  message: string;
  history?: Array<{ role: string; content: string }>;
  context?: Record<string, unknown>;
  sessionId?: string;
}

export const aiApi = {
  generate(data: AiGeneratePayload) {
    return client.post('/ai/generate', data);
  },

  generateImage(data: AiGenerateImagePayload) {
    return client.post('/ai/generate-image', data);
  },

  adminChat(data: AiAdminChatPayload) {
    return client.post('/ai/admin/chat', data);
  },

  getProviderStatus() {
    return client.get('/ai/provider-status');
  },
};
