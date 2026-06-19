<template>
  <BaseModal
    :is-open="isOpen"
    :aria-label="t('video.title')"
    :overlay-class-name="s.overlay"
    @close="handleClose"
  >
    <div :class="s.modal">
      <button :class="s.closeBtn" @click="handleClose" :aria-label="t('video.close')">
        <Icon name="close" :size="18" />
      </button>
      <div :class="s.videoWrap">
        <iframe
          ref="iframeRef"
          :class="s.iframe"
          :src="`${VIDEO_URL}&autoplay=1`"
          :title="t('video.title')"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        />
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { useVideoModalStore } from '@/stores/videoModal.pinia.js';
import Icon from '../Icon/Icon.vue';
import BaseModal from '../BaseModal/BaseModal.vue';
import s from './VideoModal.module.css';

const VIDEO_URL = 'https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1';

const { t } = useI18n();
const videoModalStore = useVideoModalStore();

const iframeRef = ref<HTMLIFrameElement | null>(null);
const isOpen = videoModalStore.isOpen;

let closeTimer: ReturnType<typeof setTimeout> | null = null;
const handleClose = () => {
  if (iframeRef.value) iframeRef.value.src = '';
  closeTimer = setTimeout(() => videoModalStore.closeVideo(), 50);
};
onUnmounted(() => {
  if (closeTimer) clearTimeout(closeTimer);
});
</script>
