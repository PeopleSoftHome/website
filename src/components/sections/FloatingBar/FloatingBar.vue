<template>
  <!-- 桌面：右侧竖排 -->
  <div :class="s.bar">
    <FloatBtn :label="t('floatingBar.demo')" @click="modalStore.openModal()">
      <template #icon><Icon name="calendar" :size="18" /></template>
    </FloatBtn>
    <FloatBtn :label="t('floatingBar.chat')" @click="emit('openChat')">
      <template #icon><Icon name="message-circle" :size="18" /></template>
    </FloatBtn>
    <FloatBtn :label="t('floatingBar.phone')" @click="emit('openContact')">
      <template #icon><Icon name="phone" :size="18" /></template>
    </FloatBtn>
    <FloatBtn
      :label="t('floatingBar.backTop')"
      :class-name="showBackTop ? '' : s.hidden"
      @click="scrollToTop"
    >
      <template #icon><Icon name="arrow-up" :size="18" /></template>
    </FloatBtn>
  </div>
  <!-- 移动端：底部横排 -->
  <div :class="s.mobileBar">
    <button :class="s.mobBtn" @click="emit('openContact')">
      <span :class="s.mobIcon"><Icon name="phone" :size="16" /></span>
      {{ t('floatingBar.callTel') }}
    </button>
    <button :class="s.mobBtn" @click="emit('openChat')">
      <span :class="s.mobIcon"><Icon name="message-circle" :size="16" /></span>
      {{ t('floatingBar.chat') }}
    </button>
    <button :class="s.mobCta" @click="modalStore.openModal()">
      {{ t('floatingBar.demo') }} <Icon name="arrow-right" :size="14" />
    </button>
  </div>
</template>

<script setup>
import { inject } from 'vue';
import { useNavScroll } from '@/composables/useNavScroll.js';
import Icon from '../../ui/Icon/Icon.vue';
import s from './FloatingBar.module.css';
import FloatBtn from './FloatBtn.vue';

const emit = defineEmits(['openChat', 'openContact']);

const { showBackTop } = useNavScroll();
const modalStore = inject('modal', { openModal: () => {} });
const { t } = useI18n();

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
</script>
