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
            :label="t(`stats.${item.id}`)"
            :is-last="i === displayStats.length - 1"
          />
        </div>
      </div>
    </div>
  </RevealWrapper>
</template>

<script setup>
import { computed, inject, ref } from 'vue';
import { STATS_DATA } from '@/data/stats.js';
import { useApiData } from '@/composables/useApiData.js';
import { cmsApi } from '@/api/cms.js';
import { transformStats } from '@/api/transforms.js';
import RevealWrapper from '../../ui/RevealWrapper/RevealWrapper.vue';
import StatItem from './StatItem.vue';
import s from './StatsSection.module.css';

const { t } = inject('i18n', { t: (k) => k });

const apiStats = ref([]);
useApiData(async () => {
  const data = await cmsApi.getStats();
  return transformStats(data);
}, apiStats);

const displayStats = computed(() => (apiStats.value.length > 0 ? apiStats.value : STATS_DATA));
</script>
