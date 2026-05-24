<template>
  <component :is="as" ref="elRef" :class="['reveal', delayClass, className]">
    <slot />
  </component>
</template>

<script setup>
import { computed } from 'vue';
import { useScrollReveal } from '@/composables/useScrollReveal.js';

const props = defineProps({
  delay:     { type: Number, default: 0 },
  as:        { type: String, default: 'div' },
  className: { type: String, default: '' },
});

const { ref: elRef } = useScrollReveal();
const delayClass = computed(() => props.delay > 0 ? `reveal-delay-${props.delay}` : '');
</script>
