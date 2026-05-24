<template>
  <span :class="[s.tag, s[variant], className]"><slot /></span>
</template>

<script setup>
import s from './Tag.module.css';

defineProps({
  variant:   { type: String, default: 'light' },
  className: { type: String, default: '' },
});
</script>
