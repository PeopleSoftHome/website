<template>
  <div v-if="total > pageSize" :class="s.pagination">
    <button
      :class="[s.pageBtn, current === 1 ? s.disabled : '']"
      :disabled="current === 1"
      @click="go(current - 1)"
    >
      {{ t('pagination.prev') }}
    </button>
    <button
      v-for="p in pages"
      :key="p"
      :class="[s.pageBtn, p === current ? s.active : '']"
      @click="go(p)"
    >
      {{ p }}
    </button>
    <button
      :class="[s.pageBtn, current === totalPages ? s.disabled : '']"
      :disabled="current === totalPages"
      @click="go(current + 1)"
    >
      {{ t('pagination.next') }}
    </button>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue';
import s from './Pagination.module.css';

const props = defineProps({
  total: { type: Number, default: 0 },
  pageSize: { type: Number, default: 10 },
  modelValue: { type: Number, default: 1 },
});

const emit = defineEmits(['update:modelValue', 'change']);
const { t } = inject('i18n', { t: (k) => k });

const current = computed({
  get: () => props.modelValue,
  set: (v) => {
    emit('update:modelValue', v);
    emit('change', v);
  },
});

const totalPages = computed(() => Math.ceil(props.total / props.pageSize));

const pages = computed(() => {
  const total = totalPages.value;
  const curr = current.value;
  const maxVisible = 7;
  if (total <= maxVisible) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  let start = Math.max(1, curr - 3);
  let end = Math.min(total, curr + 3);
  if (end - start < maxVisible - 1) {
    if (start === 1) end = Math.min(total, start + maxVisible - 1);
    else start = Math.max(1, end - maxVisible + 1);
  }
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
});

const go = (p) => {
  if (p < 1 || p > totalPages.value || p === current.value) return;
  current.value = p;
};
</script>
