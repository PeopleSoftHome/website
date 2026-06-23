/**
 * 全局 localStorage / sessionStorage key 常量
 * 避免 key 散落与冲突，便于跨项目迁移时统一替换。
 */
export const STORAGE_KEYS = {
  // 主题 & 语言
  THEME: 'tp-theme',
  LOCALE: 'tp-locale',

  // 用户认证
  USER: 'tp_user',

  // 会话 ID
  SESSION_ID: 'tp-session-id',
  RUM_SESSION_ID: 'tp-rum-session',
  CHAT_SESSION_ID: 'tp-chat-session-id',

  // Cookie 同意
  COOKIE_CONSENT: 'tp-cookie-consent',

  // 表单缓存
  DEMO_LAST_PHONE: 'tp_last_phone',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
