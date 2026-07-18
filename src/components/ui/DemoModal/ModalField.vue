<template>
  <div :class="s.formGroup">
    <label :class="s.label">
      {{ label }}
      <span v-if="required" :class="s.required">{{ t('modal.required') }}</span>
    </label>
    <slot />
    <span v-if="error" :class="s.errorMsg">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
import s from './DemoModal.module.css';

defineProps<{
  label: string;
  required?: boolean;
  error?: string;
}>();

const { t } = useI18n();
</script>
