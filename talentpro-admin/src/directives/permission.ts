/**
 * permission 模块
 *
 * 位于: directives/permission.ts
 */
import type { Directive } from 'vue';
import { useAuthStore } from '@/stores/auth';

interface PermissionElement extends HTMLElement {
  __permissionAnchor?: Text | null;
  __permissionRemoved?: boolean;
}

/**
 * v-permission 指令
 * 用法：
 *   v-permission="'user:create'"        — 有该权限则显示
 *   v-permission:all="['user:create','user:edit']" — 需同时满足
 *   v-permission:any="['user:create','user:edit']" — 满足任一即可
 */
const checkPermission = (el: PermissionElement, binding: { value: string | string[]; arg?: string }): void => {
  const auth = useAuthStore();
  const perms = binding.value;
  const mode = binding.arg || 'single'; // single | all | any

  let hasAccess = false;
  if (mode === 'all') {
    hasAccess = auth.hasAllPermissions(perms);
  } else if (mode === 'any') {
    hasAccess = auth.hasAnyPermission(perms);
  } else {
    hasAccess = auth.hasPermission(perms as string);
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

export const permissionDirective: Directive<PermissionElement, string | string[]> = {
  mounted: checkPermission,
  updated: checkPermission,
  beforeUnmount: (el) => {
    if (el.__permissionAnchor && el.__permissionAnchor.parentNode) {
      el.__permissionAnchor.parentNode.removeChild(el.__permissionAnchor);
    }
    el.__permissionAnchor = null;
  },
};
