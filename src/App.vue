<template>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <router-view />
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
import { ref, provide, onMounted, onUnmounted, onErrorCaptured, watch, getCurrentInstance } from 'vue';
import { createI18n } from '@/stores/i18n.js';
import { createTheme } from '@/stores/theme.js';
import { createModal } from '@/stores/modal.js';
import { createSearch } from '@/stores/search.js';
import { createVideoModal } from '@/stores/videoModal.js';
import { createAnalytics } from '@/stores/analytics.js';
import { createAuth } from '@/stores/auth.js';
import { useAbTest } from '@/composables/useAbTest.js';
import { defineAsyncComponent } from 'vue';
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

/* 全局状态 */
const i18n = createI18n();
const theme = createTheme();
const modal = createModal();
const search = createSearch();
const videoModal = createVideoModal();
const analytics = createAnalytics();
const auth = createAuth();

provide('i18n', i18n);
provide('theme', theme);
provide('search', search);
provide('modal', modal);
provide('videoModal', videoModal);
provide('analytics', analytics);
provide('auth', auth);
provide('authModal', { open: () => { authOpen.value = true; } });

const modalStore = modal;
const contactOpen = ref(false);
const chatOpen = ref(false);
const authOpen = ref(false);

/* Cookie 同意横幅 */
const { showBanner, showPreferences, acceptAll, rejectAll, savePreferences, openPreferences } = useCookieConsent();

/* A/B 测试 + 热力图 */
const abTest = useAbTest();
provide('abTest', abTest);

/* 全局错误捕获 + 上报 */
const reportError = (type, message, stack) => {
  try {
    const payload = {
      type,
      message: String(message).slice(0, 500),
      stack: String(stack).slice(0, 2000),
      url: window.location.href,
      ua: navigator.userAgent,
      time: new Date().toISOString(),
    };
    // 优先使用 Beacon API（不阻塞卸载）
    if (navigator.sendBeacon) {
      navigator.sendBeacon(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1'}/analytics/client-errors`, JSON.stringify(payload));
    } else {
      fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1'}/analytics/client-errors`, {
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
  console.error('[Vue Error]', err, info);
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
});

/* 页面加载埋点 + 热力图 + 滚动深度（动态加载，降低主包体积） */
onMounted(() => {
  analytics.track('page_view', { title: document.title });

  let cleanupHeatmap = null;
  let cleanupScroll = null;

  import('@/composables/useHeatmap.js').then(({ useHeatmap }) => {
    cleanupHeatmap = useHeatmap(analytics.track).initHeatmap();
  });
  import('@/composables/useScrollDepth.js').then(({ useScrollDepth }) => {
    cleanupScroll = useScrollDepth(analytics.track).initScrollDepth();
  });

  onUnmounted(() => {
    cleanupHeatmap?.();
    cleanupScroll?.();
  });
});

/* 语言/主题切换埋点 */
watch(() => i18n.locale.value, (loc, prev) => {
  if (prev !== undefined) analytics.track('lang_switch', { from: prev, to: loc });
});
watch(() => theme.theme.value, (th, prev) => {
  if (prev !== undefined) analytics.track('theme_switch', { theme: th });
});

/* 弹窗行为埋点 */
watch(() => modal.isOpen.value, (open) => {
  if (open) analytics.track('demo_modal_open');
});
watch(() => modal.step.value, (step, prev) => {
  if (step > prev && prev !== undefined) analytics.track('demo_step_complete', { step });
});
watch(() => modal.isSuccess.value, (success) => {
  if (success) analytics.track('demo_submit', { products: modal.formData.value.products });
});
watch(() => videoModal.isOpen.value, (open) => {
  if (open) analytics.track('video_play');
});
watch(() => search.isOpen.value, (open) => {
  if (open) analytics.track('search_open');
});

/* 全局 scroll reveal 观察器 */
onMounted(() => {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
          const sectionId = entry.target.closest('section')?.id;
          if (sectionId && !seenSections.has(sectionId)) {
            seenSections.add(sectionId);
            analytics.track('section_visible', { section: sectionId });
          }
        }
      });
    },
    { threshold: 0.06 }
  );

  const seenSections = new Set();
  const scan = () => {
    document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => {
      io.observe(el);
    });
  };

  scan();

  let scanTimer;
  const mo = new MutationObserver(() => {
    clearTimeout(scanTimer);
    scanTimer = setTimeout(scan, 150);
  });

  const mainEl = document.querySelector('main');
  if (mainEl) mo.observe(mainEl, { childList: true, subtree: true });

  onUnmounted(() => {
    io.disconnect();
    mo.disconnect();
    clearTimeout(scanTimer);
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
