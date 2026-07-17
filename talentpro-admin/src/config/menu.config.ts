/**
 * Admin 菜单/路由/面包屑统一配置
 *
 * 单一数据源驱动：
 * - Vue Router 路由（由 buildRoutes 生成）
 * - Sidebar 菜单（desktop + mobile）
 * - Breadcrumb 面包屑
 *
 * 新增页面只需在此文件添加一条配置，无需改 LayoutView.vue 或 router/index.ts
 *
 * v3.1.0: label 改为 i18n key，实际显示文本由 locale 文件提供
 * v4.3.2: 接入 permission.config.ts 权限矩阵，自动为菜单项附加 permissions
 */

import type { RouteRecordRaw } from 'vue-router';
import { getRoutePermissions } from './permission.config';

export interface MenuItem {
  path?: string;
  label: string;
  icon: string;
  roles: string[];
  children?: MenuItem[];
  permissions?: string[];
  permissionMode?: 'all' | 'any';
}

export interface FlatMenuItem extends MenuItem {
  isGroup?: boolean;
  isChild?: boolean;
  isItem?: boolean;
  parentLabel?: string;
}

export const menuConfig: MenuItem[] = [
  {
    path: '/dashboard',
    label: 'menu.dashboard',
    icon: 'DataLine',
    roles: ['SUPER_ADMIN', 'ADMIN', 'USER'],
  },
  {
    path: '/leads',
    label: 'menu.leads',
    icon: 'Phone',
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    path: '/users',
    label: 'menu.users',
    icon: 'User',
    roles: ['SUPER_ADMIN'],
  },
  {
    label: 'menu.systemManagement',
    icon: 'Setting',
    roles: ['SUPER_ADMIN', 'ADMIN'],
    children: [
      { path: '/system/settings', label: 'menu.systemSettings', icon: 'Tools', roles: ['SUPER_ADMIN', 'ADMIN'] },
      { path: '/system/feature-flags', label: 'menu.featureFlags', icon: 'Switch', roles: ['SUPER_ADMIN', 'ADMIN'] },
      { path: '/system/email-templates', label: 'menu.emailTemplates', icon: 'Message', roles: ['SUPER_ADMIN'] },
      { path: '/system/audit-logs', label: 'menu.auditLogs', icon: 'List', roles: ['SUPER_ADMIN', 'ADMIN'] },
      { path: '/system/roles', label: 'menu.roles', icon: 'Key', roles: ['SUPER_ADMIN'] },
      { path: '/system/workspaces', label: 'menu.workspaces', icon: 'OfficeBuilding', roles: ['SUPER_ADMIN', 'ADMIN'] },
    ],
  },
  {
    label: 'menu.contentManagement',
    icon: 'Document',
    roles: ['SUPER_ADMIN', 'ADMIN'],
    children: [
      { path: '/contents', label: 'menu.contentOverview', icon: 'Document', roles: ['SUPER_ADMIN', 'ADMIN'] },
      { path: '/page-config', label: 'menu.homeConfig', icon: 'Setting', roles: ['SUPER_ADMIN'] },
      { path: '/cms/stats', label: 'menu.stats', icon: 'DataLine', roles: ['SUPER_ADMIN', 'ADMIN'] },
      { path: '/cms/logos', label: 'menu.logoWall', icon: 'Picture', roles: ['SUPER_ADMIN', 'ADMIN'] },
      { path: '/cms/testimonials', label: 'menu.testimonials', icon: 'ChatDotSquare', roles: ['SUPER_ADMIN', 'ADMIN'] },
      { path: '/cms/products', label: 'menu.productMatrix', icon: 'Goods', roles: ['SUPER_ADMIN', 'ADMIN'] },
      { path: '/cms/industries', label: 'menu.industries', icon: 'OfficeBuilding', roles: ['SUPER_ADMIN', 'ADMIN'] },
      { path: '/cms/translations', label: 'menu.translations', icon: 'Global', roles: ['SUPER_ADMIN', 'ADMIN'] },
      { path: '/cases', label: 'menu.cases', icon: 'Document', roles: ['SUPER_ADMIN', 'ADMIN'] },
      { path: '/news', label: 'menu.news', icon: 'Message', roles: ['SUPER_ADMIN', 'ADMIN'] },
      { path: '/jobs', label: 'menu.jobs', icon: 'OfficeBuilding', roles: ['SUPER_ADMIN', 'ADMIN'] },
    ],
  },
  {
    label: 'menu.marketplace',
    icon: 'Grid',
    roles: ['SUPER_ADMIN', 'ADMIN'],
    children: [
      { path: '/marketplace/apps', label: 'menu.appManagement', icon: 'Goods', roles: ['SUPER_ADMIN', 'ADMIN'] },
      { path: '/marketplace/categories', label: 'menu.categoryManagement', icon: 'Folder', roles: ['SUPER_ADMIN', 'ADMIN'] },
      { path: '/marketplace/reviews', label: 'menu.reviewManagement', icon: 'ChatDotSquare', roles: ['SUPER_ADMIN', 'ADMIN'] },
      { path: '/marketplace/vendors', label: 'menu.vendorManagement', icon: 'OfficeBuilding', roles: ['SUPER_ADMIN', 'ADMIN'] },
      { path: '/marketplace/orders', label: 'menu.orderManagement', icon: 'Document', roles: ['SUPER_ADMIN', 'ADMIN'] },
      { path: '/marketplace/subscriptions', label: 'menu.subscriptionManagement', icon: 'Calendar', roles: ['SUPER_ADMIN', 'ADMIN'] },
      { path: '/marketplace/revenue', label: 'menu.revenueAnalysis', icon: 'DataLine', roles: ['SUPER_ADMIN', 'ADMIN'] },
    ],
  },
  {
    path: '/blogs',
    label: 'menu.blogs',
    icon: 'Reading',
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    path: '/forums',
    label: 'menu.forums',
    icon: 'ChatDotRound',
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    path: '/comment-moderation',
    label: 'menu.commentModeration',
    icon: 'Warning',
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    path: '/experiments',
    label: 'menu.experiments',
    icon: 'Aim',
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    path: '/download-records',
    label: 'menu.downloadRecords',
    icon: 'Download',
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    path: '/sensitive-words',
    label: 'menu.sensitiveWords',
    icon: 'Lock',
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    path: '/medias',
    label: 'menu.medias',
    icon: 'Picture',
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    path: '/ai-assistant',
    label: 'menu.aiAssistant',
    icon: 'Cpu',
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    path: '/analytics',
    label: 'menu.analytics',
    icon: 'DataAnalysis',
    roles: ['SUPER_ADMIN', 'ADMIN', 'USER'],
  },
];

/**
 * 为 menuConfig 自动附加权限矩阵配置
 */
function enrichPermissions(items: MenuItem[]): void {
  for (const item of items) {
    const cfg = item.path ? getRoutePermissions(item.path) : undefined;
    if (cfg) {
      item.permissions = cfg.permissions;
      item.permissionMode = cfg.mode;
    }
    if (item.children) enrichPermissions(item.children);
  }
}
enrichPermissions(menuConfig);

/**
 * 路由组件映射（非菜单项也需要在此注册，如 /login）
 */
const routeComponentMap: Record<string, () => Promise<unknown>> = {
  '/login': () => import('@/views/LoginView.vue'),
  '/dashboard': () => import('@/views/DashboardView.vue'),
  '/leads': () => import('@/views/LeadsView.vue'),
  '/users': () => import('@/views/UsersView.vue'),
  '/system/settings': () => import('@/views/SettingsView.vue'),
  '/system/feature-flags': () => import('@/views/FeatureFlagView.vue'),
  '/system/email-templates': () => import('@/views/EmailTemplateView.vue'),
  '/system/audit-logs': () => import('@/views/AuditLogView.vue'),
  '/system/roles': () => import('@/views/RolesView.vue'),
  '/system/workspaces': () => import('@/views/WorkspaceView.vue'),
  '/contents': () => import('@/views/ContentsView.vue'),
  '/page-config': () => import('@/views/PageConfigView.vue'),
  '/cms/stats': () => import('@/views/StatsView.vue'),
  '/cms/logos': () => import('@/views/LogosView.vue'),
  '/cms/testimonials': () => import('@/views/TestimonialsView.vue'),
  '/cms/products': () => import('@/views/ProductsView.vue'),
  '/cms/industries': () => import('@/views/IndustriesView.vue'),
  '/cms/translations': () => import('@/views/TranslationManagerView.vue'),
  '/cases': () => import('@/views/CaseManagerView.vue'),
  '/news': () => import('@/views/NewsManagerView.vue'),
  '/jobs': () => import('@/views/JobManagerView.vue'),
  '/marketplace/apps': () => import('@/views/AppManagerView.vue'),
  '/marketplace/categories': () => import('@/views/CategoryManagerView.vue'),
  '/marketplace/reviews': () => import('@/views/ReviewManagerView.vue'),
  '/marketplace/vendors': () => import('@/views/VendorManagerView.vue'),
  '/marketplace/orders': () => import('@/views/OrderManagerView.vue'),
  '/marketplace/subscriptions': () => import('@/views/SubscriptionManagerView.vue'),
  '/marketplace/revenue': () => import('@/views/RevenueAnalyticsView.vue'),
  '/blogs': () => import('@/views/BlogManagerView.vue'),
  '/forums': () => import('@/views/ForumManagerView.vue'),
  '/comment-moderation': () => import('@/views/CommentModerationView.vue'),
  '/analytics': () => import('@/views/AnalyticsView.vue'),
  '/experiments': () => import('@/views/ExperimentView.vue'),
  '/download-records': () => import('@/views/DownloadRecordView.vue'),
  '/sensitive-words': () => import('@/views/SensitiveWordView.vue'),
  '/medias': () => import('@/views/MediaView.vue'),
  '/ai-assistant': () => import('@/views/AiAssistantView.vue'),
};

interface RouteMetaLite {
  roles?: string[];
  permissions?: string[];
  permissionMode?: 'all' | 'any';
}

/**
 * 根据 menuConfig 生成 Vue Router routes
 */
export function buildRoutes(): RouteRecordRaw[] {
  const children: RouteRecordRaw[] = [];

  function walk(items: MenuItem[]): void {
    for (const item of items) {
      if (item.path && routeComponentMap[item.path]) {
        const meta: RouteMetaLite = {};
        if (item.roles) meta.roles = item.roles;
        if (item.permissions) meta.permissions = item.permissions;
        if (item.permissionMode) meta.permissionMode = item.permissionMode;
        children.push({
          path: item.path.replace(/^\//, ''),
          component: routeComponentMap[item.path],
          meta,
        });
      }
      if (item.children) walk(item.children);
    }
  }

  walk(menuConfig);

  return [
    { path: '/login', component: () => import('@/views/LoginView.vue'), meta: { public: true } },
    {
      path: '/',
      component: () => import('@/views/LayoutView.vue'),
      children: [
        { path: '', redirect: '/dashboard' },
        ...children,
      ],
    },
  ];
}

interface MenuAuthLike {
  hasPermission: (perm: string) => boolean;
  hasAnyPermission: (perms: string | string[]) => boolean;
  hasAllPermissions: (perms: string | string[]) => boolean;
}

/**
 * 检查当前用户是否有权限显示该菜单项
 */
export function hasMenuPermission(item: MenuItem, userRole: string, auth?: MenuAuthLike): boolean {
  if (item.roles && !item.roles.includes(userRole)) return false;
  if (item.permissions && auth) {
    const mode = item.permissionMode || 'all';
    if (mode === 'any') {
      if (!auth.hasAnyPermission(item.permissions)) return false;
    } else {
      if (!auth.hasAllPermissions(item.permissions)) return false;
    }
  }
  return true;
}

/**
 * 扁平化菜单（用于渲染 el-menu）
 */
export function flattenMenu(items: MenuItem[]): FlatMenuItem[] {
  const result: FlatMenuItem[] = [];
  for (const item of items) {
    if (item.children) {
      result.push({ ...item, isGroup: true });
      for (const child of item.children) {
        result.push({ ...child, isChild: true, parentLabel: item.label });
      }
    } else {
      result.push({ ...item, isItem: true });
    }
  }
  return result;
}
