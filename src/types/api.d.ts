/**
 * TalentPro API 类型声明
 * Phase 3: 渐进式 TypeScript 迁移起点
 */

/* ── Axios 响应包装 ── */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
}

/* ── 用户认证 ── */
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role?: string;
  workspaceId?: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt?: Date | string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

/* ── 分页 ── */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
}

/* ── 埋点 ── */
export interface AnalyticsEvent {
  event: string;
  properties: Record<string, unknown> & { ts: number; url: string };
  sessionId: string;
}

/* ── i18n ── */
export type Locale = 'zh' | 'en' | 'zh-TW';

export interface I18nStore {
  locale: import('vue').Ref<Locale>;
  setLocale: (loc: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

/* ── Vue 环境变量 ── */
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_SENTRY_DSN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
  readonly hot?: unknown;
  readonly glob: (pattern: string, options?: { eager?: boolean }) => Record<string, unknown>;
}
