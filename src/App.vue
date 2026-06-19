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

<script setup>
import { ref, onMounted, onUnmounted, onErrorCaptured, watch } from 'vue';
import { useThemeStore } from '@/stores/theme.pinia.js';
import { useModalStore } from '@/stores/modal.pinia.js';
import { useSearchStore } from '@/stores/search.pinia.js';
import { useVideoModalStore } from '@/stores/videoModal.pinia.js';
import { useAnalyticsStore } from '@/stores/analytics.pinia.js';
import { useAuthStore } from '@/stores/auth.pinia.js';
import { useAbTest } from '@/composables/useAbTest.js';
import { useRum } from '@/composables/useRum.js';
import { defineAsyncComponent } from 'vue';
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
import { useCookieConsent } from '@/composables/useCookieConsent.js';
import { useCmsTranslations } from '@/composables/useCmsTranslations.js';
import { useSiteConfig } from '@/composables/useSiteConfig.js';
import { apiClient } from '@/api/client.js';

/* 全局状态（Pinia Store） */
const { t, locale } = useI18n();
const theme = useThemeStore();
const modalStore = useModalStore();
const searchStore = useSearchStore();
const videoModalStore = useVideoModalStore();
const analyticsStore = useAnalyticsStore();

/* Pinia auth store（SSR 安全，无 localStorage token） */
const auth = useAuthStore();
if (typeof window !== 'undefined') auth.initFromStorage();

/* 401 自动刷新后重新同步用户状态 */
const onAuthRefresh = () => {
  auth.fetchProfile().catch(() => {
    auth.logout();
  });
};

/* CMS 翻译覆盖层（运行时合并后端文案） */
useCmsTranslations();

const contactOpen = ref(false);
const chatOpen = ref(false);
const authOpen = useState('authOpen', () => false);

/* 站点配置（后端驱动 title / description / hotTags / socialLinks 等） */
const { siteTitle, siteDescription } = useSiteConfig();

/* 语言切换时同步更新页面 title / meta description */
const route = useRoute();
const syncPageMeta = () => {
  const titleKey = route.meta?.title;
  if (titleKey) {
    const translated = t(titleKey);
    document.title = translated.startsWith('TalentPro')
      ? translated
      : `TalentPro — ${translated}`;
  } else if (siteTitle.value) {
    document.title = siteTitle.value;
  }
  const descKey = route.meta?.description;
  if (descKey) {
    const translated = t(descKey);
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', translated);
  } else if (siteDescription.value) {
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', siteDescription.value);
  }
};
watch(locale, syncPageMeta);
watch([siteTitle, siteDescription], syncPageMeta);

/* Cookie 同意横幅 */
const { showBanner, showPreferences, acceptAll, rejectAll, savePreferences, openPreferences } = useCookieConsent();

/* A/B 测试 + 热力图 + RUM */
useAbTest();
useRum();

/* 全局错误捕获 + 上报 */
const reportError = (type, message, stack) => {
  try {
    const url = new URL(window.location.href);
    const sensitiveParams = ['token', 'refreshToken', 'invite', 'reset', 'password'];
    sensitiveParams.forEach((p) => url.searchParams.delete(p));

    const payload = {
      type,
      message: String(message).slice(0, 500),
      stack: String(stack).slice(0, 2000),
      url: url.toString(),
      ua: navigator.userAgent,
      time: new Date().toISOString(),
    };
    const baseUrl = (apiClient.defaults.baseURL || '').replace(/\/$/, '');
    if (navigator.sendBeacon) {
      navigator.sendBeacon(`${baseUrl}/analytics/client-errors`, JSON.stringify(payload));
    } else {
      fetch(`${baseUrl}/analytics/client-errors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // 上报失败静默处理
  }
};

onErrorCaptured((err, instance, info) => {
  if (import.meta.env.DEV) {
    const compName = instance?.$options?.name || instance?.__name || 'unknown';
    console.error(`[Vue Error] Component: ${compName} | Info: ${info}`, err);
    console.trace('Error trace');
    throw err;
  }
  reportError('vue', err?.message, err?.stack);
  return false;
});

onMounted(() => {
  window.onerror = (message, source, lineno, colno, error) => {
    reportError('js', message, error?.stack);
  };
  window.onunhandledrejection = (event) => {
    reportError('promise', event.reason?.message || event.reason, event.reason?.stack);
  };
  window.addEventListener('auth:refresh', onAuthRefresh);
});

onUnmounted(() => {
  window.onerror = null;
  window.onunhandledrejection = null;
  window.removeEventListener('auth:refresh', onAuthRefresh);
});

/* 页面加载埋点 + 热力图 + 滚动深度（动态加载，降低主包体积） */
onMounted(() => {
  analyticsStore.track('page_view', { title: document.title });

  let cleanupHeatmap = null;
  let cleanupScroll = null;

  import('@/composables/useHeatmap.js').then(({ useHeatmap }) => {
    cleanupHeatmap = useHeatmap(analyticsStore.track).initHeatmap();
  });
  import('@/composables/useScrollDepth.js').then(({ useScrollDepth }) => {
    cleanupScroll = useScrollDepth(analyticsStore.track).initScrollDepth();
  });

  onUnmounted(() => {
    cleanupHeatmap?.();
    cleanupScroll?.();
  });
});

/* 语言/主题切换埋点 */
watch(locale, (loc, prev) => {
  if (prev !== undefined) analyticsStore.track('lang_switch', { from: prev, to: loc });
});
watch(() => theme.theme.value, (th, prev) => {
  if (prev !== undefined) analyticsStore.track('theme_switch', { theme: th });
});

/* 弹窗行为埋点 */
watch(() => modalStore.isOpen.value, (open) => {
  if (open) analyticsStore.track('demo_modal_open');
});
watch(() => modalStore.step.value, (step, prev) => {
  if (step > prev && prev !== undefined) analyticsStore.track('demo_step_complete', { step });
});
watch(() => modalStore.isSuccess.value, (success) => {
  if (success) analyticsStore.track('demo_submit', { products: modalStore.formData.value.products });
});
watch(() => videoModalStore.isOpen.value, (open) => {
  if (open) analyticsStore.track('video_play');
});
watch(() => searchStore.isOpen.value, (open) => {
  if (open) analyticsStore.track('search_open');
});

/* 全局 scroll reveal 观察器 */
onMounted(() => {
  const io = new IntersectionObserver(
    (entries) => {
      // observer entries
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
          const sectionId = entry.target.closest('section')?.id;
          if (sectionId && !seenSections.has(sectionId)) {
            seenSections.add(sectionId);
            analyticsStore.track('section_visible', { section: sectionId });
          }
        }
      });
    },
    { threshold: 0.06 }
  );

  const seenSections = new Set();
  const scan = () => {
    const els = document.querySelectorAll('.reveal:not(.is-visible)');
    // scan
    els.forEach((el) => {
      io.observe(el);
    });
  };

  scan();

  let scanTimer;
  const mo = new MutationObserver(() => {
    clearTimeout(scanTimer);
    scanTimer = setTimeout(scan, 150);
  });

  // 监听 Nuxt 根节点：路由切换会替换 <main>，只监听旧的 main 会失效
  const rootEl = document.querySelector('#__nuxt') || document.body || document.documentElement;
  if (rootEl) mo.observe(rootEl, { childList: true, subtree: true });

  // 路由切换完成后主动扫描一次，避免 MutationObserver 漏掉快速复用的 DOM
  const router = useRouter();
  const stopAfterEach = router.afterEach(() => {
    clearTimeout(scanTimer);
    scanTimer = setTimeout(scan, 100);
  });

  onUnmounted(() => {
    io.disconnect();
    mo.disconnect();
    clearTimeout(scanTimer);
    stopAfterEach();
  });
});
</script>

<style>
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--primary);
  color: white;
  padding: 8px 16px;
  z-index: 10000;
  font-size: 14px;
  text-decoration: none;
  border-radius: 0 0 4px 0;
  transition: top 0.2s;
}
.skip-link:focus { top: 0; }
</style>
