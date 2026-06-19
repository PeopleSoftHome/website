<template>
  <span ref="el">{{ display }}</span>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps({ value: { type: String, default: '' } });
const el = ref<HTMLElement | null>(null);
const display = ref(props.value);

onMounted(() => {
  const match = String(props.value).match(/([0-9.]+)/);
  if (!match || !el.value || match.index === undefined) return;
  const target = parseFloat(match[0]);
  const prefix = props.value.slice(0, match.index);
  const suffix = props.value.slice(match.index + match[0].length);
  const isFloat = match[0].includes('.');

  const obs = new IntersectionObserver(
    ([entry]) => {
      if (!entry || !entry.isIntersecting || !el.value || el.value.dataset.animated) return;
        el.value.dataset.animated = '1';
        const start = performance.now();
        const dur = 1600;
        const tick = (now: number) => {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const cur = isFloat
            ? Math.round(eased * target * 10) / 10
            : Math.floor(eased * target);
          display.value = prefix + cur + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        obs.disconnect();
    },
    { threshold: 0.5 }
  );
  obs.observe(el.value);
});
</script>
