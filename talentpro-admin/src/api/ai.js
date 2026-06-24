import client from './client.js';

export const aiApi = {
  generate(data) {
    return client.post('/ai/generate', data);
  },
};
