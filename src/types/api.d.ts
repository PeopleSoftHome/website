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

/* ── Nuxt 3 runtimeConfig.public 类型（浏览器端公开变量）── */
interface ImportMetaEnv {
  readonly NUXT_PUBLIC_API_BASE_URL?: string;
  readonly NUXT_PUBLIC_APP_ENV?: string;
  readonly NUXT_PUBLIC_SENTRY_DSN?: string;
  readonly NUXT_PUBLIC_RECAPTCHA_SITE_KEY?: string;
  readonly NUXT_PUBLIC_ASSET_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
  readonly hot?: unknown;
  readonly glob: (pattern: string, options?: { eager?: boolean }) => Record<string, unknown>;
}
