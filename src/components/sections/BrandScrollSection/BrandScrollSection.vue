<template>
  <div :class="s.section">
    <p :class="s.label">{{ t('marquee.label') }}</p>
    <div :class="s.wrapper">
      <div :class="s.track">
        <span v-for="(name, i) in logos" :key="i" :class="s.logo">{{ name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue';
import { BRAND_LOGOS } from '@/data/stats.js';
import s from './BrandScrollSection.module.css';

const { t } = useI18n();
const logos = [...BRAND_LOGOS, ...BRAND_LOGOS];
</script>
