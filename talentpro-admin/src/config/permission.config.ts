/**
 * Admin 权限矩阵
 *
 * 以资源:操作 形式声明每个路由所需的权限，供路由守卫、菜单渲染与 v-permission 指令统一使用。
 * SUPER_ADMIN 在 auth store 中默认绕过所有权限校验；其余角色按矩阵匹配。
 *
 * 约定：
 * - read   查看列表/详情
 * - create 创建
 * - update 编辑/审核/状态变更
 * - delete 删除
 * - manage 包含该资源全部操作（仅特殊资源使用）
 */

export type PermissionMode = 'all' | 'any';

export interface RoutePermission {
  permissions: string[];
  mode: PermissionMode;
}

export const RESOURCE_PERMISSIONS: Record<string, string[]> = {
  dashboard: ['dashboard:read'],
  leads: ['lead:read', 'lead:update'],
  users: ['user:read', 'user:create', 'user:update', 'user:delete'],
  roles: ['role:read', 'role:create', 'role:update', 'role:delete'],
  workspaces: ['workspace:read', 'workspace:create', 'workspace:update', 'workspace:delete'],
  settings: ['setting:update'],
  featureFlags: ['feature_flag:read', 'feature_flag:update'],
  emailTemplates: ['email_template:read', 'email_template:update'],
  auditLogs: ['audit_log:read'],
  contents: ['cms:read', 'cms:create', 'cms:update', 'cms:delete'],
  pageConfig: ['page_config:read', 'page_config:update'],
  cmsStats: ['cms_stats:read'],
  logos: ['logo:read', 'logo:update'],
  testimonials: ['testimonial:read', 'testimonial:update'],
  products: ['product:read', 'product:update'],
  industries: ['industry:read', 'industry:update'],
  translations: ['translation:read', 'translation:update'],
  cases: ['case:read', 'case:create', 'case:update', 'case:delete'],
  news: ['news:read', 'news:create', 'news:update', 'news:delete'],
  jobs: ['job:read', 'job:create', 'job:update', 'job:delete'],
  apps: ['app:read', 'app:create', 'app:update', 'app:delete'],
  categories: ['category:read', 'category:create', 'category:update', 'category:delete'],
  reviews: ['review:read', 'review:update', 'review:delete'],
  vendors: ['vendor:read', 'vendor:create', 'vendor:update', 'vendor:delete'],
  orders: ['order:read', 'order:update'],
  subscriptions: ['subscription:read', 'subscription:update'],
  revenue: ['revenue:read'],
  blogs: ['blog:read', 'blog:create', 'blog:update', 'blog:delete'],
  forums: ['forum:read', 'forum:update', 'forum:delete'],
  commentModeration: ['comment:read', 'comment:update', 'comment:delete'],
  analytics: ['analytics:read'],
  experiments: ['experiment:read', 'experiment:update'],
  downloadRecords: ['download_record:read'],
  sensitiveWords: ['sensitive_word:read', 'sensitive_word:update'],
  medias: ['media:read', 'media:create', 'media:update', 'media:delete'],
  aiAssistant: ['ai:chat'],
};

/**
 * 路由 -> 权限配置
 * permissionMode: 'all' 表示需同时拥有；'any' 表示满足其一即可。
 */
export const ROUTE_PERMISSIONS: Record<string, RoutePermission> = {
  '/dashboard': { permissions: RESOURCE_PERMISSIONS.dashboard, mode: 'all' },
  '/leads': { permissions: RESOURCE_PERMISSIONS.leads, mode: 'all' },
  '/users': { permissions: RESOURCE_PERMISSIONS.users, mode: 'all' },
  '/system/settings': { permissions: RESOURCE_PERMISSIONS.settings, mode: 'all' },
  '/system/feature-flags': { permissions: RESOURCE_PERMISSIONS.featureFlags, mode: 'all' },
  '/system/email-templates': { permissions: RESOURCE_PERMISSIONS.emailTemplates, mode: 'all' },
  '/system/audit-logs': { permissions: RESOURCE_PERMISSIONS.auditLogs, mode: 'all' },
  '/system/roles': { permissions: RESOURCE_PERMISSIONS.roles, mode: 'all' },
  '/system/workspaces': { permissions: RESOURCE_PERMISSIONS.workspaces, mode: 'all' },
  '/contents': { permissions: RESOURCE_PERMISSIONS.contents, mode: 'all' },
  '/page-config': { permissions: RESOURCE_PERMISSIONS.pageConfig, mode: 'all' },
  '/cms/stats': { permissions: RESOURCE_PERMISSIONS.cmsStats, mode: 'all' },
  '/cms/logos': { permissions: RESOURCE_PERMISSIONS.logos, mode: 'all' },
  '/cms/testimonials': { permissions: RESOURCE_PERMISSIONS.testimonials, mode: 'all' },
  '/cms/products': { permissions: RESOURCE_PERMISSIONS.products, mode: 'all' },
  '/cms/industries': { permissions: RESOURCE_PERMISSIONS.industries, mode: 'all' },
  '/cms/translations': { permissions: RESOURCE_PERMISSIONS.translations, mode: 'all' },
  '/cases': { permissions: RESOURCE_PERMISSIONS.cases, mode: 'all' },
  '/news': { permissions: RESOURCE_PERMISSIONS.news, mode: 'all' },
  '/jobs': { permissions: RESOURCE_PERMISSIONS.jobs, mode: 'all' },
  '/marketplace/apps': { permissions: RESOURCE_PERMISSIONS.apps, mode: 'all' },
  '/marketplace/categories': { permissions: RESOURCE_PERMISSIONS.categories, mode: 'all' },
  '/marketplace/reviews': { permissions: RESOURCE_PERMISSIONS.reviews, mode: 'all' },
  '/marketplace/vendors': { permissions: RESOURCE_PERMISSIONS.vendors, mode: 'all' },
  '/marketplace/orders': { permissions: RESOURCE_PERMISSIONS.orders, mode: 'all' },
  '/marketplace/subscriptions': { permissions: RESOURCE_PERMISSIONS.subscriptions, mode: 'all' },
  '/marketplace/revenue': { permissions: RESOURCE_PERMISSIONS.revenue, mode: 'all' },
  '/blogs': { permissions: RESOURCE_PERMISSIONS.blogs, mode: 'all' },
  '/forums': { permissions: RESOURCE_PERMISSIONS.forums, mode: 'all' },
  '/comment-moderation': { permissions: RESOURCE_PERMISSIONS.commentModeration, mode: 'all' },
  '/analytics': { permissions: RESOURCE_PERMISSIONS.analytics, mode: 'all' },
  '/experiments': { permissions: RESOURCE_PERMISSIONS.experiments, mode: 'all' },
  '/download-records': { permissions: RESOURCE_PERMISSIONS.downloadRecords, mode: 'all' },
  '/sensitive-words': { permissions: RESOURCE_PERMISSIONS.sensitiveWords, mode: 'all' },
  '/medias': { permissions: RESOURCE_PERMISSIONS.medias, mode: 'all' },
  '/ai-assistant': { permissions: RESOURCE_PERMISSIONS.aiAssistant, mode: 'all' },
};

/**
 * 根据路由路径获取权限配置
 */
export function getRoutePermissions(path: string): RoutePermission | null {
  return ROUTE_PERMISSIONS[path] || null;
}

interface AuthLike {
  hasAnyPermission: (perms: string | string[]) => boolean;
  hasAllPermissions: (perms: string | string[]) => boolean;
}

/**
 * 检查单个菜单项是否匹配权限矩阵；若无配置则放行。
 */
export function checkRoutePermission(item: { path?: string }, auth: AuthLike): boolean {
  const cfg = item.path ? getRoutePermissions(item.path) : null;
  if (!cfg) return true;
  const { permissions, mode } = cfg;
  if (mode === 'any') return auth.hasAnyPermission(permissions);
  return auth.hasAllPermissions(permissions);
}
