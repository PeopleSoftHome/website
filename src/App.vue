<template>
  <IconSprite />
  <a href="#main-content" class="skip-link">{{ t('skipLink') }}</a>
  <NuxtLayout>
    <ErrorBoundary>
      <NuxtPage />
    </ErrorBoundary>
  </NuxtLayout>
  <FloatingBar @open-chat="chatOpen = true" @open-contact="contactOpen = true" />

  <DemoModal />
  <VideoModal />
  <SearchModal />
  <ContactModal :is-open="contactOpen" @close="contactOpen = false" />
  <AuthModal :is-open="authOpen" @close="authOpen = false" />
  <ChatBot
    :is-open="chatOpen"
    @close="chatOpen = false"
    @open-demo="modalStore.openModal(); chatOpen = false"
    @open-contact="contactOpen = true; chatOpen = false"
  />
  <CookieBanner
    :show-banner="showBanner"
    :show-preferences="showPreferences"
    @accept-all="acceptAll"
    @reject-all="rejectAll"
    @save-prefs="savePreferences"
    @open-preferences="openPreferences"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, defineAsyncComponent, provide } from 'vue';
import { useThemeStore } from '@/stores/theme.pinia';
import { useModalStore } from '@/stores/modal.pinia';
import { useSearchStore } from '@/stores/search.pinia';
import { useVideoModalStore } from '@/stores/videoModal.pinia';
import { useAnalyticsStore } from '@/stores/analytics.pinia';
import { useAuthStore } from '@/stores/auth.pinia';
import { useAbTest } from '@/composables/useAbTest';
import { useRum } from '@/composables/useRum';
import { useCookieConsent } from '@/composables/useCookieConsent';
import { useCmsTranslations } from '@/composables/useCmsTranslations';
import { useSiteConfig } from '@/shared/composables/useSiteConfig';
import { useGlobalErrorReporter } from '@/composables/useGlobalErrorReporter';
import { usePageMetaSync } from '@/composables/usePageMetaSync';
import { usePrefetchModals } from '@/composables/usePrefetchModals';
import { setDateLocale } from '@/shared/utils/date';
import { useLifecycleAnalytics } from '@/composables/useLifecycleAnalytics';
import { useGlobalRevealObserver } from '@/composables/useGlobalRevealObserver';

import ErrorBoundary from '@/components/ErrorBoundary.vue';
import IconSprite from '@/components/ui/Icon/IconSprite.vue';
import FloatingBar from '@/components/sections/FloatingBar/FloatingBar.vue';
import DemoModal from '@/components/ui/DemoModal/DemoModal.vue';
import VideoModal from '@/components/ui/VideoModal/VideoModal.vue';
import CookieBanner from '@/components/ui/CookieBanner/CookieBanner.vue';

/* 按需异步加载的大体积弹窗/组件，降低主包体积 */
const SearchModal = defineAsyncComponent(() => import('@/components/ui/SearchModal/SearchModal.vue'));
const ContactModal = defineAsyncComponent(() => import('@/components/ui/ContactModal/ContactModal.vue'));
const AuthModal = defineAsyncComponent(() => import('@/components/ui/AuthModal/AuthModal.vue'));
const ChatBot = defineAsyncComponent(() => import('@/components/ui/ChatBot/ChatBot.vue'));

/* 全局状态（Pinia Store） */
const { t, locale } = useI18n();
const route = useRoute();
const theme = useThemeStore();
const modalStore = useModalStore();
const searchStore = useSearchStore();
const videoModalStore = useVideoModalStore();
const analyticsStore = useAnalyticsStore();
const auth = useAuthStore();

/* Pinia auth store（SSR 安全，无 localStorage token） */
if (typeof window !== 'undefined') auth.initFromStorage();

/* 401 自动刷新后重新同步用户状态 */
const onAuthRefresh = () => {
  auth.fetchProfile().catch(() => {
    auth.logout();
  });
};

/* 全局初始化 */
useCmsTranslations();
useAbTest();
useRum();
const { reportError } = useGlobalErrorReporter();
provide('reportError', reportError);
usePrefetchModals();

/* 日期格式跟随应用语言 */
watch(locale, (val) => { setDateLocale(val); }, { immediate: true });

/* Cookie 同意横幅 */
const { showBanner, showPreferences, acceptAll, rejectAll, savePreferences, openPreferences } = useCookieConsent();

/* 站点配置与页面 Meta 同步 */
const { siteTitle, siteDescription } = useSiteConfig();
usePageMetaSync({ route, locale, siteTitle, siteDescription, t });

/* 生命周期埋点 */
useLifecycleAnalytics({
  analyticsStore,
  locale,
  theme,
  modalStore,
  videoModalStore,
  searchStore,
});

/* 全局滚动入场动画 */
useGlobalRevealObserver({ analyticsStore });

/* 弹窗开关 */
const contactOpen = ref(false);
const chatOpen = ref(false);
const authOpen = useState('authOpen', () => false);

/* 认证刷新事件 */
onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('auth:refresh', onAuthRefresh);
  }
});
onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('auth:refresh', onAuthRefresh);
  }
});
</script>

<style>
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--primary);
  color: var(--white);
  padding: 8px 16px;
  z-index: 10000;
  font-size: 14px;
  text-decoration: none;
  border-radius: 0 0 4px 0;
  transition: top 0.2s;
}
.skip-link:focus { top: 0; }
</style>
