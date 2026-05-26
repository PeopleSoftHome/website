<template>
  <div :class="[s.skeleton, animate ? s.animate : '']" :style="wrapStyle" />
</template>

<script setup>
import { computed } from 'vue';
import s from './Skeleton.module.css';

const props = defineProps({
  width: { type: String, default: '100%' },
  height: { type: String, default: '16px' },
  radius: { type: String, default: 'var(--radius-sm)' },
  animate: { type: Boolean, default: true },
});

const wrapStyle = computed(() => ({
  width: props.width,
  height: props.height,
  borderRadius: props.radius,
}));
</script>
