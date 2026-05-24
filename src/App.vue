<template>
  <div class="migration-placeholder">
    <h1>TalentPro v2 — Vue 3 Migration</h1>
    <p>Phase 0: Tooling scaffold complete. Dev server running on Vue 3.</p>
    <p>Vue version: {{ vueVersion }}</p>
  </div>
</template>

<script setup>
import { version as vueVersion } from 'vue';
</script>

<style scoped>
.migration-placeholder {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: 'Noto Sans SC', system-ui, sans-serif;
  background: linear-gradient(135deg, #1B5FEB 0%, #0EA5E9 100%);
  color: white;
}
h1 { font-size: 2rem; margin-bottom: 0.5rem; }
p { font-size: 1.125rem; opacity: 0.9; }
</style>
