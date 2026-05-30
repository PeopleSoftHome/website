/**
 * 全局路由中间件 — 认证守卫 + 页面 Meta 同步
 * 替代原 Vue Router 的 setupRouterGuards
 */

export default defineNuxtRouteMiddleware((to) => {
  // 从 App.vue 注入的全局状态中获取 store 实例
  const authStore = useState('auth').value;
  const i18nStore = useState('i18n').value;

  /* ── 认证守卫 ── */
  if (to.meta.requiresAuth && !authStore?.isLoggedIn?.value) {
    const authOpen = useState('authOpen', () => false);
    authOpen.value = true;
    return navigateTo('/');
  }

  /* ── 页面标题 + meta description 同步 ── */
  if (i18nStore && typeof document !== 'undefined') {
    const titleKey = to.meta.title;
    if (titleKey) {
      const translated = i18nStore.t(titleKey);
      document.title = translated.startsWith('TalentPro')
        ? translated
        : `TalentPro — ${translated}`;
    }
    const descKey = to.meta.description;
    if (descKey) {
      const translated = i18nStore.t(descKey);
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute('content', translated);
    }
  }
});
