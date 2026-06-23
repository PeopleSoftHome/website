import { apiClient } from './client';
import type { AxiosResponse } from 'axios';

/**
 * 基于 fetch + ReadableStream 的 EventSource 兼容封装
 * 支持自定义 Authorization header，避免 token 泄露到 URL / 日志 / 历史记录
 */
class FetchEventSource {
  url: string;
  closed: boolean;
  ctrl: AbortController;
  onmessage: ((event: { data: string }) => void) | null;
  onerror: ((error: Error) => void) | null;

  constructor(url: string) {
    this.url = url;
    this.closed = false;
    this.ctrl = new AbortController();
    this.onmessage = null;
    this.onerror = null;
    this._connect();
  }

  _connect() {
    fetch(this.url, {
      credentials: 'include',
      headers: { Accept: 'text/event-stream' },
      signal: this.ctrl.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error(`SSE HTTP ${response.status}`);
        if (!response.body) throw new Error('SSE response body is empty');
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
              buffer = parts.pop() || '';
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
  getNotifications(page = 1, pageSize = 20): Promise<AxiosResponse> {
    return apiClient.get('/notifications', { params: { page, pageSize } });
  },

  markAsRead(id: string | number): Promise<AxiosResponse> {
    return apiClient.patch(`/notifications/${id}/read`);
  },

  markAllAsRead(): Promise<AxiosResponse> {
    return apiClient.patch('/notifications/read-all');
  },

  /**
   * 创建 SSE 连接
   * 使用 httpOnly Cookie 鉴权，不将 token 暴露在 URL/header 中
   */
  createEventSource(): FetchEventSource | EventSource {
    const baseUrl = (apiClient.defaults.baseURL || '').replace(/\/$/, '');
    const url = `${baseUrl}/notifications/stream`;

    if (typeof ReadableStream !== 'undefined' && typeof AbortController !== 'undefined') {
      return new FetchEventSource(url);
    }

    // 降级：标准 EventSource 同样携带同源 Cookie
    return new EventSource(url, { withCredentials: true });
  },
};
