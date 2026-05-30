<template>
  <div :class="s.timeline">
    <div v-for="(step, i) in (data.steps || [])" :key="i" :class="s.timelineStep">
      <div :class="s.timelineIcon">
        <Icon :name="step.icon" :size="16" />
      </div>
      <div :class="s.timelineConnector" aria-hidden="true" />
      <div :class="s.timelineLabel">{{ step.label }}</div>
      <div :class="s.timelineDesc">{{ step.desc }}</div>
    </div>
  </div>
</template>

<script setup>
import s from '../ProductScreenshot.module.css';
import Icon from '../../../ui/Icon/Icon.vue';

defineProps({ data: { type: Object, required: true } });
</script>
