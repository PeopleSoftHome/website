<template>
  <div :class="s.taskList">
    <div :class="s.taskHeader">{{ t('industry.taskHeader') }}</div>
    <div v-for="(t, i) in (data.tasks || [])" :key="i" :class="s.taskItem">
      <span :class="s.taskText">{{ t.text }}</span>
      <span :class="s.taskStatus" :style="{ color: t.statusColor }">{{ t.status }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import s from '../ProductScreenshot.module.css';

const { t } = useI18n();

defineProps({ data: { type: Object, required: true } });
</script>
