<template>
  <div :class="[s.card, 'reveal', delayClass]">
    <span v-if="hot" :class="s.badge"><Icon name="flame" :size="12" /> HOT</span>
    <div :class="s.icon" style="color: var(--ai-purple-light)">
      <component :is="icon" v-if="typeof icon === 'function'" />
      <template v-else><Icon :name="icon" :size="20" /></template>
    </div>
    <div :class="s.name">{{ name }}</div>
    <p :class="s.tagline">{{ tagline }}</p>
    <span :class="s.link">{{ linkText }} <Icon name="arrow-right" :size="12" /></span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Icon from '../../ui/Icon/Icon.vue';
import s from './AiCard.module.css';

const props = defineProps({
  icon:     { type: [Function, String], required: true },
  name:     { type: String, required: true },
  tagline:  { type: String, required: true },
  hot:      { type: Boolean, default: false },
  hotLabel: { type: String, default: 'HOT' },
  linkText: { type: String, default: '' },
  delay:    { type: Number, default: 0 },
});

const delayClass = computed(() => props.delay > 0 ? `reveal-delay-${props.delay}` : '');
</script>
