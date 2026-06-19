<template>
  <button
    :class="[s.btn, className]"
    @click="emit('click')"
    :aria-label="label"
  >
    <span :class="s.btnIcon">
      <slot name="icon" />
    </span>
    <span :class="s.label">{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
import s from './FloatingBar.module.css';

defineProps({
  label:     { type: String, required: true },
  className: { type: String, default: '' },
});
const emit = defineEmits(['click']);
</script>
