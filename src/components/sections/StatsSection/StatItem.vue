<template>
  <div :class="[s.item, isLast ? s.last : '']">
    <div :class="s.num">
      <span ref="numRef">0</span>
    </div>
    <div :class="s.label">{{ label }}</div>
  </div>
</template>

<script setup lang="ts">
import { useCountUp } from '@/composables/useCountUp.js';
import s from './StatsSection.module.css';

const props = defineProps({
  target: { type: Number, required: true },
  suffix: { type: String, default: '' },
  label:  { type: String, required: true },
  isLast: { type: Boolean, default: false },
});

const { ref: numRef } = useCountUp(props.target, { suffix: props.suffix });
</script>
