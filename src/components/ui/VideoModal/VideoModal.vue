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

<script setup>
import { ref, inject } from 'vue';
import Icon from '../Icon/Icon.vue';
import BaseModal from '../BaseModal/BaseModal.vue';
import s from './VideoModal.module.css';

const VIDEO_URL = 'https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1';

const { t } = inject('i18n', { t: (k) => k });
const videoStore = inject('videoModal', { isOpen: ref(false), closeVideo: () => {} });

const iframeRef = ref(null);
const isOpen = videoStore.isOpen;

const handleClose = () => {
  if (iframeRef.value) iframeRef.value.src = '';
  setTimeout(() => videoStore.closeVideo(), 50);
};
</script>
