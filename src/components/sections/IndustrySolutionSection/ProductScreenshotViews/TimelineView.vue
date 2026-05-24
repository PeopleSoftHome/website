<template>
  <div :class="s.timeline">
    <div v-for="(step, i) in data.steps" :key="i" :class="s.timelineStep">
      <div :class="s.timelineIcon">{{ step.icon }}</div>
      <div :class="s.timelineConnector" aria-hidden="true" />
      <div :class="s.timelineLabel">{{ step.label }}</div>
      <div :class="s.timelineDesc">{{ step.desc }}</div>
    </div>
  </div>
</template>

<script setup>
import s from '../ProductScreenshot.module.css';

defineProps({ data: { type: Object, required: true } });
</script>
