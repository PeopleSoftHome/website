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

<script setup lang="ts">
import { computed } from 'vue';
import { getBrandLogos } from '@/data/stats';
import s from './BrandScrollSection.module.css';

const { t, locale } = useI18n();
const brandLogos = computed(() => getBrandLogos(locale.value));
const logos = computed(() => [...brandLogos.value, ...brandLogos.value]);
</script>
