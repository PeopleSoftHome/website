/**
 * Router Guards — 路由守卫与页面 Meta 同步
 * ───────────────────────────────────────────
 * 从 App.vue 迁移至此，保持路由逻辑集中管理
 */

import { watch } from 'vue';

/**
 * 设置路由守卫与页面 Meta 同步
 * @param {import('vue-router').Router} router
 * @param {ReturnType<import('@/stores/auth.js').createAuth>} auth
 * @param {ReturnType<import('@/stores/i18n.js').createI18n>} i18n
 * @param {import('vue').Ref<boolean>} authOpenRef — 控制 AuthModal 显示的 ref
 */
export function setupRouterGuards(router, auth, i18n, authOpenRef) {
  const { t } = i18n;

  /* ── 认证守卫：拦截需要登录的路由 ── */
  router.beforeEach((to, from, next) => {
    if (to.meta?.requiresAuth && !auth.isLoggedIn.value) {
      authOpenRef.value = true;
      next(false);
      return;
    }
    next();
  });

  /* ── 页面标题 + meta description 自动同步 ── */
  const updatePageMeta = () => {
    const route = router.currentRoute.value;
    const titleKey = route.meta?.title;
    if (titleKey) {
      const translated = t(titleKey);
      document.title = translated.startsWith('TalentPro')
        ? translated
        : `TalentPro — ${translated}`;
    }
    const descKey = route.meta?.description;
    if (descKey) {
      const translated = t(descKey);
      let meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute('content', translated);
    }
  };

  watch(() => router.currentRoute.value.path, updatePageMeta, { immediate: true });
  watch(() => i18n.locale.value, updatePageMeta);
}
