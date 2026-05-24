<template>
  <!-- 桌面：右侧竖排 -->
  <div :class="s.bar">
    <FloatBtn icon="📅" :label="t('floatingBar.demo')" @click="modalStore.openModal()" />
    <FloatBtn icon="💬" :label="t('floatingBar.chat')" @click="emit('openChat')" />
    <FloatBtn icon="📞" :label="t('floatingBar.phone')" @click="emit('openContact')" />
    <FloatBtn
      icon="↑"
      :label="t('floatingBar.backTop')"
      :class-name="showBackTop ? '' : s.hidden"
      @click="scrollToTop"
    />
  </div>
  <!-- 移动端：底部横排 -->
  <div :class="s.mobileBar">
    <button :class="s.mobBtn" @click="emit('openContact')">
      <span :class="s.mobIcon">📞</span>
      {{ t('floatingBar.callTel') }}
    </button>
    <button :class="s.mobBtn" @click="emit('openChat')">
      <span :class="s.mobIcon">💬</span>
      {{ t('floatingBar.chat') }}
    </button>
    <button :class="s.mobCta" @click="modalStore.openModal()">
      {{ t('floatingBar.demo') }} →
    </button>
  </div>
</template>

<script setup>
import { inject } from 'vue';
import { useNavScroll } from '@/composables/useNavScroll.js';
import s from './FloatingBar.module.css';

const emit = defineEmits(['openChat', 'openContact']);

const { showBackTop } = useNavScroll();
const modalStore = inject('modal', { openModal: () => {} });
const { t } = inject('i18n', { t: (k) => k });

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
</script>
