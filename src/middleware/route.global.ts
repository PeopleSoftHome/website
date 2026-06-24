/**
 * 全局路由中间件 — 认证守卫 + 页面 Meta 同步
 * 替代原 Vue Router 的 setupRouterGuards
 */

import type { RouteLocationNormalized } from 'vue-router';

export default defineNuxtRouteMiddleware((to: RouteLocationNormalized) => {
  const authStore = useAuthStore();
  const nuxtApp = useNuxtApp();
  const t = (nuxtApp.$i18n as { t: (key: string) => string }).t.bind(nuxtApp.$i18n);

  /* ── 认证守卫 ── */
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    const authOpen = useState('authOpen', () => false);
    authOpen.value = true;
    return navigateTo('/');
  }

  /* ── 页面标题 + meta description 同步 ── */
  if (typeof document !== 'undefined') {
    const titleKey = to.meta.title;
    if (titleKey) {
      const translated = t(titleKey as string);
      document.title = translated.startsWith('TalentPro')
        ? translated
        : `TalentPro — ${translated}`;
    }
    const descKey = to.meta.description;
    if (descKey) {
      const translated = t(descKey as string);
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute('content', translated);
    }
  }
});
