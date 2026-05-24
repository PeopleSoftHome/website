<template>
  <div :class="[s.card, 'reveal', delayClass]">
    <div :class="s.cover" :style="{ background: imgGrad }">
      <div :class="s.coverIcon">{{ icon }}</div>
      <span :class="s.typeTag" :style="{ background: typeStyle.bg, color: typeStyle.color }">
        {{ typeLabel }}
      </span>
    </div>
    <div :class="s.body">
      <h3 :class="s.title">{{ title }}</h3>
      <p :class="s.desc">{{ desc }}</p>
      <div :class="s.footer">
        <span :class="s.date">{{ date }}</span>
        <span :class="s.cta">{{ cta }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { RESOURCE_TYPE_STYLES } from '@/data/resources.js';
import s from './ResourceCard.module.css';

const props = defineProps({
  type:      { type: String, required: true },
  typeLabel: { type: String, required: true },
  icon:      { type: String, required: true },
  imgGrad:   { type: String, required: true },
  title:     { type: String, required: true },
  desc:      { type: String, required: true },
  date:      { type: String, required: true },
  cta:       { type: String, required: true },
  delay:     { type: Number, default: 0 },
});

const delayClass = computed(() => props.delay > 0 ? `reveal-delay-${props.delay}` : '');
const typeStyle = computed(() => RESOURCE_TYPE_STYLES[props.type] ?? RESOURCE_TYPE_STYLES.article);
</script>
