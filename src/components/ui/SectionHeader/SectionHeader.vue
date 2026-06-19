<template>
  <div :class="[s.header, s[variant], className]">
    <Tag v-if="tag" :variant="tagVariant">{{ tag }}</Tag>
    <h2 :class="s.title">{{ title }}</h2>
    <p v-if="subtitle" :class="s.subtitle">{{ subtitle }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Tag from '../Tag/Tag.vue';
import s from './SectionHeader.module.css';

const props = defineProps({
  tag:       { type: String, default: '' },
  title:     { type: String, required: true },
  subtitle:  { type: String, default: '' },
  variant:   { type: String, default: 'light' },
  className: { type: String, default: '' },
});

const tagVariant = computed(() => props.variant === 'dark' ? 'ai' : 'light');
</script>
