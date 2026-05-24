<template>
  <button
    :class="[s.btn, className]"
    @click="emit('click')"
    :aria-label="label"
  >
    <span :class="s.btnIcon">{{ icon }}</span>
    <span :class="s.label">{{ label }}</span>
  </button>
</template>

<script setup>
import s from './FloatingBar.module.css';

defineProps({
  icon:      { type: String, required: true },
  label:     { type: String, required: true },
  className: { type: String, default: '' },
});
const emit = defineEmits(['click']);
</script>
