<template>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <NavBar />
  <main id="main-content">
    <HomePage />
  </main>
  <Footer />
  <FloatingBar @open-chat="chatOpen = true" @open-contact="contactOpen = true" />

  <DemoModal />
  <VideoModal />
  <SearchModal />
  <ContactModal :is-open="contactOpen" @close="contactOpen = false" />
  <ChatBot
    :is-open="chatOpen"
    @close="chatOpen = false"
    @open-demo="modalStore.openModal(); chatOpen = false"
  />
</template>

<script setup>
import { ref, provide, onMounted, onUnmounted, onErrorCaptured } from 'vue';
import { createI18n } from '@/stores/i18n.js';
import { createTheme } from '@/stores/theme.js';
import { createModal } from '@/stores/modal.js';
import { createSearch } from '@/stores/search.js';
import { createVideoModal } from '@/stores/videoModal.js';
import NavBar from '@/components/layout/NavBar/NavBar.vue';
import Footer from '@/components/layout/Footer/Footer.vue';
import FloatingBar from '@/components/sections/FloatingBar/FloatingBar.vue';
import HomePage from '@/pages/HomePage.vue';
import DemoModal from '@/components/ui/DemoModal/DemoModal.vue';
import VideoModal from '@/components/ui/VideoModal/VideoModal.vue';
import SearchModal from '@/components/ui/SearchModal/SearchModal.vue';
import ContactModal from '@/components/ui/ContactModal/ContactModal.vue';
import ChatBot from '@/components/ui/ChatBot/ChatBot.vue';

/* 全局状态 */
const i18n = createI18n();
const theme = createTheme();
const modal = createModal();
const search = createSearch();
const videoModal = createVideoModal();

provide('i18n', i18n);
provide('theme', theme);
provide('search', search);
provide('modal', modal);
provide('videoModal', videoModal);

const modalStore = modal;
const contactOpen = ref(false);
const chatOpen = ref(false);

/* 全局错误捕获 */
onErrorCaptured((err, instance, info) => {
  console.error('[Vue Error]', err, info);
  return false;
});

/* 全局 scroll reveal 观察器 */
onMounted(() => {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.06 }
  );

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
