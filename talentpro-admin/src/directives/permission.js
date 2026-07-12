/**
 * permission 模块
 *
 * 位于: directives/permission.js
 */
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

  if (hasAccess) {
    if (el.__permissionAnchor && el.__permissionRemoved) {
      el.__permissionAnchor.parentNode?.insertBefore(el, el.__permissionAnchor);
      el.__permissionRemoved = false;
    }
    el.style.display = '';
  } else {
    if (!el.__permissionRemoved && el.parentNode) {
      const anchor = document.createTextNode('');
      el.parentNode.insertBefore(anchor, el);
      el.parentNode.removeChild(el);
      el.__permissionAnchor = anchor;
      el.__permissionRemoved = true;
    }
  }
};

export const permissionDirective = {
  mounted: checkPermission,
  updated: checkPermission,
  beforeUnmount: (el) => {
    if (el.__permissionAnchor && el.__permissionAnchor.parentNode) {
      el.__permissionAnchor.parentNode.removeChild(el.__permissionAnchor);
    }
    el.__permissionAnchor = null;
  },
};
