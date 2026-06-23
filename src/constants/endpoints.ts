/**
 * 后端 API endpoint 路径常量
 * 便于跨环境/跨项目配置与维护。
 */
export const ENDPOINTS = {
  // 认证
  AUTH_LOGIN: '/auth/login',
  AUTH_REGISTER: '/auth/register',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_ME: '/auth/me',

  // 线索 / 预约演示
  DEMO_BOOKINGS: '/demo-bookings',

  // 分析 / 埋点
  ANALYTICS_EVENTS: '/analytics/events',
  ANALYTICS_WEB_VITALS: '/analytics/web-vitals',
  ANALYTICS_CLIENT_ERRORS: '/analytics/client-errors',

  // AI / ChatBot
  AI_CHAT: '/ai/chat',
  SYSTEM_CHATBOT_CONFIG: '/system/chatbot-config',

  // A/B 测试
  EXPERIMENTS_RUNNING: '/experiments/running',

  // CMS
  CMS_TRANSLATIONS: '/cms/translations',

  // 公开站点配置
  SYSTEM_CONFIG_PUBLIC: '/system/config/public',
} as const;

export type EndpointPath = (typeof ENDPOINTS)[keyof typeof ENDPOINTS];
