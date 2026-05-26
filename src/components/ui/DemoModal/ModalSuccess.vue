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

<script setup>
import { computed, inject } from 'vue';
import Icon from '../Icon/Icon.vue';
import s from './DemoModal.module.css';

const { t } = inject('i18n', { t: (k) => k });
const modalStore = inject('modal', { formData: { value: {} } });

const lines = computed(() => t('modal.successSub').split('\n'));

const summary = computed(() => ({
  name: modalStore.formData.value.name || '',
  company: modalStore.formData.value.company || '',
  products: modalStore.formData.value.products || [],
  scale: modalStore.formData.value.scale || '',
}));

const hasSummary = computed(() =>
  summary.value.name || summary.value.company || summary.value.scale,
);
</script>
