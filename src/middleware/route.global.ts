/**
 * 全局路由中间件 — 认证守卫 + 页面 Meta 同步
 * 替代原 Vue Router 的 setupRouterGuards
 */

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore();
  const { t } = useI18n();

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
      const translated = t(titleKey);
      document.title = translated.startsWith('TalentPro')
        ? translated
        : `TalentPro — ${translated}`;
    }
    const descKey = to.meta.description;
    if (descKey) {
      const translated = t(descKey);
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute('content', translated);
    }
  }
});
