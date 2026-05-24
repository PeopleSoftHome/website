<template>
  <button
    :type="type"
    :class="[s.btn, s[variant], s[size], className]"
    @click="emit('click', $event)"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<script setup>
import s from './Button.module.css';

defineProps({
  variant:   { type: String, default: 'primary' },
  size:      { type: String, default: 'md' },
  className: { type: String, default: '' },
  type:      { type: String, default: 'button' },
  disabled:  { type: Boolean, default: false },
});
const emit = defineEmits(['click']);
</script>
