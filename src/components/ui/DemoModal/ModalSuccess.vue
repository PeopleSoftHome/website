<template>
  <div :class="s.success">
    <div :class="s.successIcon">
      <Icon name="check-circle" :size="48" color="var(--primary)" />
    </div>
    <div :class="s.successTitle">{{ t('modal.successTitle') }}</div>
    <p :class="s.successSub">
      <span v-for="(line, i) in lines" :key="i">
        {{ line }}
        <br v-if="i < lines.length - 1" />
      </span>
    </p>

    <!-- 预约信息摘要 -->
    <div v-if="hasSummary" :class="s.summary">
      <div :class="s.summaryItem">
        <span :class="s.summaryLabel">{{ t('modal.summaryName') }}</span>
        <span :class="s.summaryValue">{{ summary.name }}</span>
      </div>
      <div :class="s.summaryItem">
        <span :class="s.summaryLabel">{{ t('modal.summaryCompany') }}</span>
        <span :class="s.summaryValue">{{ summary.company }}</span>
      </div>
      <div v-if="summary.products.length" :class="s.summaryItem">
        <span :class="s.summaryLabel">{{ t('modal.summaryProducts') }}</span>
        <span :class="s.summaryValue">{{ summary.products.join('、') }}</span>
      </div>
      <div :class="s.summaryItem">
        <span :class="s.summaryLabel">{{ t('modal.summaryScale') }}</span>
        <span :class="s.summaryValue">{{ summary.scale }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useModalStore } from '@/stores/modal.pinia.js';
import Icon from '../Icon/Icon.vue';
import s from './DemoModal.module.css';

const { t } = useI18n();
const modalStore = useModalStore();

const lines = computed(() => t('modal.successSub').split('\n'));

const summary = computed(() => ({
  name: modalStore.formData.name || '',
  company: modalStore.formData.company || '',
  products: modalStore.formData.products || [],
  scale: modalStore.formData.scale || '',
}));

const hasSummary = computed(() =>
  summary.value.name || summary.value.company || summary.value.scale,
);
</script>
