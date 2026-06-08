/**
 * Admin 菜单/路由/面包屑统一配置
 *
 * 单一数据源驱动：
 * - Vue Router 路由（由 buildRoutes 生成）
 * - Sidebar 菜单（desktop + mobile）
 * - Breadcrumb 面包屑
 *
 * 新增页面只需在此文件添加一条配置，无需改 LayoutView.vue 或 router/index.js
 */

export const menuConfig = [
  {
    path: '/dashboard',
    label: '仪表盘',
    icon: 'DataLine',
    roles: ['SUPER_ADMIN', 'ADMIN', 'USER'],
  },
  {
    path: '/leads',
    label: '线索管理',
    icon: 'Phone',
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    path: '/users',
    label: '用户管理',
    icon: 'User',
    roles: ['SUPER_ADMIN'],
  },
  {
    label: '系统管理',
    icon: 'Setting',
    roles: ['SUPER_ADMIN', 'ADMIN'],
    children: [
      { path: '/system/settings', label: '系统设置', icon: 'Tools', roles: ['SUPER_ADMIN', 'ADMIN'] },
      { path: '/system/email-templates', label: '邮件模板', icon: 'Message', roles: ['SUPER_ADMIN'] },
      { path: '/system/audit-logs', label: '审计日志', icon: 'List', roles: ['SUPER_ADMIN', 'ADMIN'] },
      { path: '/system/roles', label: '角色管理', icon: 'Key', roles: ['SUPER_ADMIN'] },
      { path: '/system/workspaces', label: '工作空间', icon: 'OfficeBuilding', roles: ['SUPER_ADMIN', 'ADMIN'] },
    ],
  },
  {
    label: '内容管理',
    icon: 'Document',
    roles: ['SUPER_ADMIN', 'ADMIN'],
    children: [
      { path: '/contents', label: '内容概览', icon: 'Document', roles: ['SUPER_ADMIN', 'ADMIN'] },
      { path: '/page-config', label: '首页配置', icon: 'Setting', roles: ['SUPER_ADMIN'] },
      { path: '/cms/stats', label: '统计数据', icon: 'DataLine', roles: ['SUPER_ADMIN', 'ADMIN'] },
      { path: '/cms/logos', label: 'Logo 墙', icon: 'Picture', roles: ['SUPER_ADMIN', 'ADMIN'] },
      { path: '/cms/testimonials', label: '客户证言', icon: 'ChatDotSquare', roles: ['SUPER_ADMIN', 'ADMIN'] },
      { path: '/cms/products', label: '产品矩阵', icon: 'Goods', roles: ['SUPER_ADMIN', 'ADMIN'] },
      { path: '/cms/industries', label: '行业方案', icon: 'OfficeBuilding', roles: ['SUPER_ADMIN', 'ADMIN'] },
      { path: '/cases', label: '客户案例', icon: 'Document', roles: ['SUPER_ADMIN', 'ADMIN'] },
      { path: '/news', label: '新闻管理', icon: 'Message', roles: ['SUPER_ADMIN', 'ADMIN'] },
      { path: '/jobs', label: '招聘管理', icon: 'OfficeBuilding', roles: ['SUPER_ADMIN', 'ADMIN'] },
    ],
  },
  {
    label: '应用广场',
    icon: 'Grid',
    roles: ['SUPER_ADMIN', 'ADMIN'],
    children: [
      { path: '/marketplace/apps', label: '应用管理', icon: 'Goods', roles: ['SUPER_ADMIN', 'ADMIN'] },
      { path: '/marketplace/categories', label: '分类管理', icon: 'Folder', roles: ['SUPER_ADMIN', 'ADMIN'] },
      { path: '/marketplace/reviews', label: '评价管理', icon: 'ChatDotSquare', roles: ['SUPER_ADMIN', 'ADMIN'] },
      { path: '/marketplace/vendors', label: '厂商管理', icon: 'OfficeBuilding', roles: ['SUPER_ADMIN', 'ADMIN'] },
    ],
  },
  {
    path: '/blogs',
    label: '博客管理',
    icon: 'Reading',
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    path: '/forums',
    label: '论坛管理',
    icon: 'ChatDotRound',
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    path: '/comment-moderation',
    label: '评论审核',
    icon: 'Warning',
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    path: '/experiments',
    label: 'A/B 测试',
    icon: 'Aim',
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    path: '/download-records',
    label: '下载留资',
    icon: 'Download',
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    path: '/sensitive-words',
    label: '敏感词',
    icon: 'Lock',
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    path: '/medias',
    label: '媒体库',
    icon: 'Picture',
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    path: '/analytics',
    label: '数据分析',
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
  '/cases': () => import('@/views/CaseManagerView.vue'),
  '/news': () => import('@/views/NewsManagerView.vue'),
  '/jobs': () => import('@/views/JobManagerView.vue'),
  '/marketplace/apps': () => import('@/views/AppManagerView.vue'),
  '/marketplace/categories': () => import('@/views/CategoryManagerView.vue'),
  '/marketplace/reviews': () => import('@/views/ReviewManagerView.vue'),
  '/marketplace/vendors': () => import('@/views/VendorManagerView.vue'),
  '/blogs': () => import('@/views/BlogManagerView.vue'),
  '/forums': () => import('@/views/ForumManagerView.vue'),
  '/comment-moderation': () => import('@/views/CommentModerationView.vue'),
  '/analytics': () => import('@/views/AnalyticsView.vue'),
  '/experiments': () => import('@/views/ExperimentView.vue'),
  '/download-records': () => import('@/views/DownloadRecordView.vue'),
  '/sensitive-words': () => import('@/views/SensitiveWordView.vue'),
  '/medias': () => import('@/views/MediaView.vue'),
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
