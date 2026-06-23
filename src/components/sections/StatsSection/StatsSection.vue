<template>
  <RevealWrapper>
    <div :class="s.section">
      <div class="container">
        <div :class="s.grid">
          <StatItem
            v-for="(item, i) in displayStats"
            :key="item.id"
            :target="item.target"
            :suffix="item.suffix"
            :label="item.displayLabel || t(`stats.${item.id}`)"
            :is-last="i === displayStats.length - 1"
          />
        </div>
      </div>
    </div>
  </RevealWrapper>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue';

import { useCmsDataByKey } from '@/composables/useCmsData';

import RevealWrapper from '../../ui/RevealWrapper/RevealWrapper.vue';
import StatItem from './StatItem.vue';
import s from './StatsSection.module.css';

interface CmsStatItem {
  label?: string;
  value?: string | number;
  suffix?: string;
  [key: string]: unknown;
}

interface StatItemData {
  id: string;
  target: number;
  suffix: string;
  displayLabel: string;
}

const { t } = useI18n();

const { displayItems: rawDisplayStats, isLoading: loading } = useCmsDataByKey('stats', {
  transform: (active: unknown[]) => (active || []).map((item) => {
    const it = item as CmsStatItem;
    return {
      id: it.label
        ? it.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        : `stat-${Math.random().toString(36).slice(2, 7)}`,
      target: parseInt(String(it.value).replace(/\D/g, ''), 10) || 0,
      suffix: it.suffix || '',
      displayLabel: it.label || '',
    };
  }),
  fallbackKey: 'stats',
});
const displayStats = computed(() => rawDisplayStats.value as unknown as StatItemData[]);


</script>
