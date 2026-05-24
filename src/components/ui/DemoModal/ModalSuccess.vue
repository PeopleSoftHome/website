<template>
  <div :class="s.success">
    <div :class="s.successIcon">🎉</div>
    <div :class="s.successTitle">{{ t('modal.successTitle') }}</div>
    <p :class="s.successSub">
      <span v-for="(line, i) in lines" :key="i">
        {{ line }}
        <br v-if="i < lines.length - 1" />
      </span>
    </p>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue';
import s from './DemoModal.module.css';

const { t } = inject('i18n', { t: (k) => k });
const lines = computed(() => t('modal.successSub').split('\n'));
</script>
