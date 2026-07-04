/**
 * Admin 菜单/路由/面包屑统一配置
 *
 * 单一数据源驱动：
 * - Vue Router 路由（由 buildRoutes 生成）
 * - Sidebar 菜单（desktop + mobile）
 * - Breadcrumb 面包屑
 *
 * 新增页面只需在此文件添加一条配置，无需改 LayoutView.vue 或 router/index.js
 *
 * v3.1.0: label 改为 i18n key，实际显示文本由 locale 文件提供
 */

export const menuConfig = [
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
 * 路由组件映射（非菜单项也需要在此注册，如 /login）
 */
const routeComponentMap = {
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

/**
 * 根据 menuConfig 生成 Vue Router routes
 */
export function buildRoutes() {
  const children = [];

  function walk(items) {
    for (const item of items) {
      if (item.path && routeComponentMap[item.path]) {
        const route = {
          path: item.path.replace(/^\//, ''),
          component: routeComponentMap[item.path],
        };
        route.meta = {};
        if (item.roles) route.meta.roles = item.roles;
        if (item.permissions) route.meta.permissions = item.permissions;
        if (item.permissionMode) route.meta.permissionMode = item.permissionMode;
        children.push(route);
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

/**
 * 检查当前用户是否有权限显示该菜单项
 * @param {Object} item - 菜单项
 * @param {string} userRole - 用户角色
 * @param {Object} auth - auth store（含 hasPermission / hasAnyPermission / hasAllPermissions）
 */
export function hasMenuPermission(item, userRole, auth) {
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
export function flattenMenu(items) {
  const result = [];
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
