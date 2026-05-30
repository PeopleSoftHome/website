<template>
  <div :class="s.compact">
    <p :class="s.text">
      {{ t('cookie.banner') }}
      <button
        type="button"
        :class="s.linkBtn"
        @click="emit('open-preferences')"
        :aria-label="t('cookie.learnMore')"
      >
        {{ t('cookie.learnMore') }}
      </button>
    </p>
    <div :class="s.actions">
      <button type="button" :class="s.btnReject" @click="emit('reject')">
        {{ t('cookie.reject') }}
      </button>
      <button type="button" :class="s.btnAccept" @click="emit('accept')">
        {{ t('cookie.acceptAll') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue';
import s from './CookieBanner.module.css';

const emit = defineEmits(['accept', 'reject', 'open-preferences']);

const i18n = inject('i18n');
const t = (key) => i18n?.t(key) ?? key;
</script>
