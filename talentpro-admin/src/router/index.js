import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth.js';
import { buildRoutes } from '@/config/menu.config.js';

const router = createRouter({
  history: createWebHistory(),
  routes: buildRoutes(),
});

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore();

  if (!to.meta.public && !auth.isLoggedIn) {
    next('/login');
    return;
  }

  if (to.path === '/login' && auth.isLoggedIn) {
    next('/dashboard');
    return;
  }

  if (auth.isLoggedIn && !auth.user) {
    await auth.fetchProfile();
  }

  if (to.meta.roles && auth.user) {
    if (!to.meta.roles.includes(auth.role)) {
      next('/dashboard');
      return;
    }
  }

  if (to.meta.permissions && auth.user) {
    const required = to.meta.permissions;
    const mode = to.meta.permissionMode || 'all';
    let hasAccess = false;
    if (mode === 'any') {
      hasAccess = auth.hasAnyPermission(required);
    } else {
      hasAccess = auth.hasAllPermissions(required);
    }
    if (!hasAccess) {
      next('/dashboard');
      return;
    }
  }

  next();
});

export default router;
