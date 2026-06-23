<template>
  <div v-if="screenshot && type" :class="s.card">
    <div :class="s.header">
      <span :class="s.title">{{ screenshot.title }}</span>
    </div>
    <div :class="s.body">
      <TableView v-if="type === 'table'" :data="screenshot" />
      <MetricsView v-else-if="type === 'metrics'" :data="screenshot" />
      <TasksView v-else-if="type === 'tasks'" :data="screenshot" />
      <TimelineView v-else-if="type === 'timeline'" :data="screenshot" />
      <Grid9View v-else-if="type === 'grid9'" :data="screenshot" />
    </div>
  </div>
</template>

<script setup lang="ts">
import s from './ProductScreenshot.module.css';
import TableView from './ProductScreenshotViews/TableView.vue';
import MetricsView from './ProductScreenshotViews/MetricsView.vue';
import TasksView from './ProductScreenshotViews/TasksView.vue';
import TimelineView from './ProductScreenshotViews/TimelineView.vue';
import Grid9View from './ProductScreenshotViews/Grid9View.vue';

const props = defineProps({
  screenshot: { type: Object, default: () => ({}) },
});

const type = props.screenshot?.type;
</script>
