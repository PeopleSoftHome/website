<template>
  <div :style="{ minHeight: height + 'px' }" aria-hidden="true" />
</template>

<script setup>
defineProps({
  height: { type: Number, default: 400 }
});
</script>
