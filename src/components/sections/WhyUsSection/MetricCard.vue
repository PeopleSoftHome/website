<template>
  <div :class="[s.card, 'reveal', delayClass]">
    <div :class="s.num">{{ num }}</div>
    <div :class="s.label">{{ label }}</div>
    <p :class="s.desc">{{ desc }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import s from './MetricCard.module.css';

const props = defineProps({
  num:   { type: String, required: true },
  label: { type: String, required: true },
  desc:  { type: String, required: true },
  delay: { type: Number, default: 0 },
});

const delayClass = computed(() => props.delay > 0 ? `reveal-delay-${props.delay}` : '');
</script>
