<template>
  <div :class="s.metricsGrid">
    <div v-for="m in data.metrics" :key="m.label" :class="s.metricCard">
      <div :class="s.metricValue" :style="{ color: m.color }">{{ m.value }}</div>
      <div :class="s.metricLabel">{{ m.label }}</div>
    </div>
  </div>
</template>

<script setup>
import s from '../ProductScreenshot.module.css';

defineProps({ data: { type: Object, required: true } });
</script>
