<template>
  <NuxtLink :to="`/marketplace/${app.slug}`" :class="s.card">
    <div :class="s.header">
      <div :class="s.iconWrap">
        <span :class="s.iconText">{{ app.name.charAt(0) }}</span>
      </div>
      <div :class="s.meta">
        <span v-if="pricingLabel" :class="[s.badge, s[app.pricingModel]]">{{ pricingLabel }}</span>
        <div :class="s.rating">
          <span :class="s.stars">{{ stars }}</span>
          <span :class="s.ratingNum">{{ app.ratingAvg }}</span>
          <span :class="s.ratingCount">({{ app.ratingCount }})</span>
        </div>
      </div>
    </div>
    <h3 :class="s.name">{{ app.name }}</h3>
    <p :class="s.tagline">{{ app.tagline }}</p>
    <p :class="s.desc">{{ (app.description || '').slice(0, 90) }}...</p>
    <div :class="s.footer">
      <span :class="s.vendor">{{ app.vendor }}</span>
      <span :class="s.installs">{{ installText }}</span>
    </div>
  </NuxtLink>
</template>

<script setup>
import { computed } from 'vue';
import s from './AppCard.module.css';

const props = defineProps({
  app: { type: Object, required: true },
});

const pricingLabel = computed(() => {
  const map = {
    free: '免费',
    subscription: '订阅',
    one_time: '买断',
    usage_based: '按量',
    freemium: '增值',
  };
  return map[props.app.pricingModel] || '';
});

const stars = computed(() => {
  const full = Math.floor(props.app.ratingAvg || 0);
  const half = props.app.ratingAvg % 1 >= 0.5 ? 1 : 0;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - half);
});

const installText = computed(() => {
  const n = props.app.installCount || 0;
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万 次安装`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k 次安装`;
  return `${n} 次安装`;
});
</script>
