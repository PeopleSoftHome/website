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

<script setup>
import { computed, inject, ref } from 'vue';

import { useCmsData, useCmsDataByKey } from '@/composables/useCmsData.js';
import { apiClient } from '@/api/client.js';
import RevealWrapper from '../../ui/RevealWrapper/RevealWrapper.vue';
import StatItem from './StatItem.vue';
import s from './StatsSection.module.css';

const { t } = inject('i18n', { t: (k) => k });

const { displayItems: displayStats, isLoading: loading } = useCmsDataByKey('stats', {
  transform: (active) => (active || []).map((item) => ({
    id: item.label
      ? item.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      : `stat-${Math.random().toString(36).slice(2, 7)}`,
    target: parseInt(String(item.value).replace(/\D/g, ''), 10) || 0,
    suffix: item.suffix || '',
    displayLabel: item.label || '',
  })),
  fallbackKey: 'stats',
});


</script>
