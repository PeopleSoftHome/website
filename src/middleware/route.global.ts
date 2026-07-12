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

  /* ── 页面标题 + meta description 同步（SSR 安全：使用 useHead）── */
  const titleKey = to.meta.title;
  const descKey = to.meta.description;

  let title: string | undefined;
  if (titleKey) {
    const translated = t(titleKey as string);
    title = translated.startsWith('TalentPro')
      ? translated
      : `TalentPro — ${translated}`;
  }

  const meta = descKey
    ? [{ name: 'description', content: t(descKey as string) }]
    : [];

  if (title || meta.length) {
    useHead({ title, meta });
  }
});
