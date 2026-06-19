<template>
  <div :class="s.avatarWrap" :style="wrapStyle">
    <NuxtImg v-if="src" :src="src" :alt="alt" :class="s.avatarImg" loading="lazy" placeholder />
    <span v-else :class="s.avatarFallback">{{ initial }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import s from './Avatar.module.css';

const props = defineProps({
  src: { type: String, default: '' },
  name: { type: String, default: '' },
  alt: { type: String, default: '' },
  size: { type: Number, default: 32 },
});

const initial = computed(() => {
  const n = props.name || props.alt || '';
  return n.charAt(0).toUpperCase();
});

const wrapStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  fontSize: `${Math.max(12, props.size * 0.4)}px`,
}));
</script>
