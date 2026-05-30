import { useAuthStore } from '@/stores/auth.js';

/**
 * v-permission 指令
 * 用法：
 *   v-permission="'user:create'"        — 有该权限则显示
 *   v-permission:all="['user:create','user:edit']" — 需同时满足
 *   v-permission:any="['user:create','user:edit']" — 满足任一即可
 */
const checkPermission = (el, binding) => {
  const auth = useAuthStore();
  const perms = binding.value;
  const mode = binding.arg || 'single'; // single | all | any

  let hasAccess = false;
  if (mode === 'all') {
    hasAccess = auth.hasAllPermissions(perms);
  } else if (mode === 'any') {
    hasAccess = auth.hasAnyPermission(perms);
  } else {
    hasAccess = auth.hasPermission(perms);
  }

  el.style.display = hasAccess ? '' : 'none';
};

export const permissionDirective = {
  mounted: checkPermission,
  updated: checkPermission,
};
