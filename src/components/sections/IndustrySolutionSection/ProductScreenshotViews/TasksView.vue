<template>
  <div :class="s.taskList">
    <div :class="s.taskHeader">待处理事项</div>
    <div v-for="(t, i) in data.tasks" :key="i" :class="s.taskItem">
      <span :class="s.taskText">{{ t.text }}</span>
      <span :class="s.taskStatus" :style="{ color: t.statusColor }">{{ t.status }}</span>
    </div>
  </div>
</template>

<script setup>
import s from '../ProductScreenshot.module.css';

defineProps({ data: { type: Object, required: true } });
</script>
