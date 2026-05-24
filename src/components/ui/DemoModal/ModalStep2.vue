<template>
  <div>
    <div :class="s.stepTitle">{{ t('modal.step2Title') }}</div>
    <div :class="s.stepSub">{{ t('modal.step2Sub') }}</div>
    <div :class="s.pills">
      <button
        v-for="p in PRODUCTS"
        :key="p"
        :class="[s.pill, selected.has(p) ? s.pillSelected : '']"
        @click="toggle(p)"
      >
        {{ p }}
      </button>
    </div>
    <button :class="s.submitBtn" @click="emit('next')">{{ t('modal.next') }}</button>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue';
import s from './DemoModal.module.css';

const { t } = inject('i18n', { t: (k) => k });
const PRODUCTS = t('modal.products') || [];
const selected = ref(new Set(PRODUCTS.slice(0, 1)));

const toggle = (p) => {
  const next = new Set(selected.value);
  next.has(p) ? next.delete(p) : next.add(p);
  selected.value = next;
};

const emit = defineEmits(['next']);
</script>
