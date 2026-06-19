<template>
  <NavBar />
  <slot />
  <Footer />
</template>

<script setup lang="ts">
import NavBar from '@/components/layout/NavBar/NavBar.vue';
import Footer from '@/components/layout/Footer/Footer.vue';
</script>
