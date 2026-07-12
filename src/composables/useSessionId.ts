/**
 * useSessionId — 通用会话 ID 管理
 * 自动从 storage 读取已有 ID，不存在则生成并持久化。
 */
export interface UseSessionIdOptions {
  key: string;
  storage?: 'localStorage' | 'sessionStorage';
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useSessionId(options: UseSessionIdOptions) {
  const { key, storage = 'sessionStorage' } = options;
  const store = storage === 'localStorage' ? localStorage : sessionStorage;

  function getId(): string {
    if (typeof window === 'undefined') return '';
    let id = store.getItem(key);
    if (!id) {
      id = generateId();
      store.setItem(key, id);
    }
    return id;
  }

  function resetId(): string {
    if (typeof window === 'undefined') return '';
    const id = generateId();
    store.setItem(key, id);
    return id;
  }

  return { getId, resetId };
}

/** 快捷方法：获取或创建指定 storage key 的会话 ID */
export function getOrCreateSessionId(key: string, storage: 'localStorage' | 'sessionStorage' = 'sessionStorage'): string {
  if (typeof window === 'undefined') return '';
  const store = storage === 'localStorage' ? localStorage : sessionStorage;
  let id = store.getItem(key);
  if (!id) {
    id = generateId();
    store.setItem(key, id);
  }
  return id;
}
