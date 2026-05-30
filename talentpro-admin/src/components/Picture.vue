<template>
  <picture>
    <source
      v-if="webpSrc"
      :srcset="webpSrc"
      type="image/webp"
    />
    <img
      :src="src"
      :alt="alt"
      :loading="loading"
      :class="imgClass"
      :style="imgStyle"
    />
  </picture>
</template>

<script setup>
defineProps({
  src: { type: String, required: true },
  webpSrc: { type: String, default: '' },
  alt: { type: String, default: '' },
  loading: { type: String, default: 'lazy' },
  imgClass: { type: [String, Array, Object], default: '' },
  imgStyle: { type: [String, Object], default: '' },
});
</script>
