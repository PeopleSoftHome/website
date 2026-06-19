<template>
  <span ref="el">{{ display }}</span>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted, inject } from 'vue';

const props = defineProps({
  value:   { type: Number, required: true },
  prefix:  { type: String, default: '' },
  suffix:  { type: String, default: '' },
  duration:{ type: Number, default: 600 },
});

const el = ref(null);
const display = ref('');
let rafId = null;
const { t } = useI18n();

function animate(from, to) {
  if (rafId) cancelAnimationFrame(rafId);
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / props.duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current = Math.round(from + (to - from) * eased);

    if (current >= 10000) {
      display.value = props.prefix + (current / 10000).toFixed(1) + t('units.tenThousand') + props.suffix;
    } else {
      display.value = props.prefix + current.toLocaleString() + props.suffix;
    }

    if (progress < 1) {
      rafId = requestAnimationFrame(tick);
    }
  };

  rafId = requestAnimationFrame(tick);
}

// 提取数字部分进行动画
let lastNum = 0;
watch(() => props.value, (newVal) => {
  animate(lastNum, newVal);
  lastNum = newVal;
}, { immediate: true });

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId);
});
</script>
