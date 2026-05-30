<template>
  <NavBar />
  <slot />
  <Footer />
</template>

<script setup>
import NavBar from '@/components/layout/NavBar/NavBar.vue';
import Footer from '@/components/layout/Footer/Footer.vue';
</script>
