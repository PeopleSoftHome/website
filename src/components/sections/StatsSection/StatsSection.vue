<template>
  <RevealWrapper>
    <div :class="s.section">
      <div class="container">
        <div :class="s.grid">
          <StatItem
            v-for="(item, i) in STATS_DATA"
            :key="item.id"
            :target="item.target"
            :suffix="item.suffix"
            :label="t(`stats.${item.id}`)"
            :is-last="i === STATS_DATA.length - 1"
          />
        </div>
      </div>
    </div>
  </RevealWrapper>
</template>

<script setup>
import { inject } from 'vue';
import { STATS_DATA } from '@/data/stats.js';
import RevealWrapper from '../../ui/RevealWrapper/RevealWrapper.vue';
import StatItem from './StatItem.vue';
import s from './StatsSection.module.css';

const { t } = inject('i18n', { t: (k) => k });
</script>
