<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    :stroke="color"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    :class="className"
    aria-hidden="true"
  >
    <use :href="`#icon-${name}`" />
  </svg>
</template>

<script setup>
defineProps({
  name:      { type: String, required: true },
  size:      { type: [Number, String], default: 20 },
  color:     { type: String, default: 'currentColor' },
  className: { type: String, default: '' },
});
</script>
