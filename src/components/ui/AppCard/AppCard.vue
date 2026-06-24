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

<script setup lang="ts">
import { computed } from 'vue';
import s from './AppCard.module.css';

interface MarketplaceApp {
  slug: string;
  name: string;
  tagline: string;
  description?: string;
  pricingModel: 'free' | 'subscription' | 'one_time' | 'usage_based' | 'freemium';
  ratingAvg: number;
  ratingCount: number;
  installCount: number;
  vendor: string;
}

const props = defineProps<{ app: MarketplaceApp }>();

const { t } = useI18n();

const pricingLabel = computed(() => {
  const map = {
    free: t('marketplace.pricingShort.free'),
    subscription: t('marketplace.pricingShort.subscription'),
    one_time: t('marketplace.pricingShort.oneTime'),
    usage_based: t('marketplace.pricingShort.usage'),
    freemium: t('marketplace.pricingShort.freemium'),
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
  const suffix = t('marketplace.installs');
  if (n >= 10000) return `${(n / 10000).toFixed(1)}${t('units.tenThousand')} ${suffix}`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k ${suffix}`;
  return `${n} ${suffix}`;
});
</script>
