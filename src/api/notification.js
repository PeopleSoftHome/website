import { apiClient } from './client.js';
import { API_BASE_URL } from './baseUrl.js';

/**
 * 基于 fetch + ReadableStream 的 EventSource 兼容封装
 * 支持自定义 Authorization header，避免 token 泄露到 URL / 日志 / 历史记录
 */
class FetchEventSource {
  constructor(url, token) {
    this.url = url;
    this.token = token;
    this.closed = false;
    this.ctrl = new AbortController();
    this.onmessage = null;
    this.onerror = null;
    this._connect();
  }

  _connect() {
    fetch(this.url, {
      headers: { Authorization: `Bearer ${this.token}`, Accept: 'text/event-stream' },
      signal: this.ctrl.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error(`SSE HTTP ${response.status}`);
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        const pump = () => {
          reader
            .read()
            .then(({ done, value }) => {
              if (this.closed) return;
              if (done) {
                if (this.onerror) this.onerror(new Error('SSE stream closed'));
                return;
              }
              buffer += decoder.decode(value, { stream: true });
              // SSE 消息以 \n\n 分隔
              const parts = buffer.split('\n\n');
              buffer = parts.pop();
              parts.forEach((part) => {
                const dataLine = part.split('\n').find((l) => l.startsWith('data:'));
                if (dataLine && this.onmessage) {
                  this.onmessage({ data: dataLine.slice(5).trim() });
                }
              });
              pump();
            })
            .catch((err) => {
              if (!this.closed && this.onerror) this.onerror(err);
            });
        };
        pump();
      })
      .catch((err) => {
        if (!this.closed && this.onerror) this.onerror(err);
      });
  }

  close() {
    this.closed = true;
    this.ctrl.abort();
  }
}

export const notificationApi = {
  getNotifications(page = 1, pageSize = 20) {
    return apiClient.get('/notifications', { params: { page, pageSize } });
  },

  markAsRead(id) {
    return apiClient.patch(`/notifications/${id}/read`);
  },

  markAllAsRead() {
    return apiClient.patch('/notifications/read-all');
  },

  /**
   * 创建 SSE 连接
   * 优先使用 FetchEventSource（header 传 token），降级到标准 EventSource（query param）
   */
  createEventSource(token) {
    const url = `${API_BASE_URL}/notifications/stream`;

    if (typeof ReadableStream !== 'undefined' && typeof AbortController !== 'undefined') {
      return new FetchEventSource(url, token);
    }

    // 降级：标准 EventSource（token 通过 query parameter 传递）
    const fallbackUrl = `${url}?token=${encodeURIComponent(token)}`;
    return new EventSource(fallbackUrl);
  },
};
