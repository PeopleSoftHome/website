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

<script setup lang="ts">
import s from './Button.module.css';

defineProps({
  variant:   { type: String, default: 'primary' },
  size:      { type: String, default: 'md' },
  className: { type: String, default: '' },
  type:      { type: String as () => 'button' | 'submit' | 'reset', default: 'button' },
  disabled:  { type: Boolean, default: false },
});
const emit = defineEmits(['click']);
</script>
