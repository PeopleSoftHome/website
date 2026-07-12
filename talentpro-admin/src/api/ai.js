import client from './client.js';

export const aiApi = {
  generate(data) {
    return client.post('/ai/generate', data);
  },

  generateImage(data) {
    return client.post('/ai/generate-image', data);
  },

  adminChat(data) {
    return client.post('/ai/admin/chat', data);
  },

  getProviderStatus() {
    return client.get('/ai/provider-status');
  },
};
