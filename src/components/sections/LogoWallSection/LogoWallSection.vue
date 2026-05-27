<template>
  <section :class="s.section">
    <div class="container">
      <RevealWrapper>
        <h2 :class="s.title">{{ t('logoWall.title') }}</h2>
      </RevealWrapper>
      <RevealWrapper>
        <div :class="s.filters" role="group" :aria-label="t('logoWall.filterLabel')">
          <button
            v-for="f in displayFilters"
            :key="f.id"
            :class="[s.filterBtn, activeFilter === f.id ? s.filterActive : '']"
            @click="activeFilter = f.id"
          >
            {{ f.label }}
          </button>
        </div>
      </RevealWrapper>
      <RevealWrapper>
        <div :class="s.grid">
          <div
            v-for="item in displayLogos"
            :key="item.id"
            :class="[s.item, isHidden(item) ? s.hidden : '']"
            :aria-hidden="isHidden(item)"
          >
            <div :class="s.itemInner">
              <div :class="s.logoCircle" :style="{ '--brand': item.brandColor }">
                <span :class="s.logoInitial">{{ item.initial }}</span>
              </div>
              <span :class="s.name">{{ item.name }}</span>
            </div>
          </div>
        </div>
      </RevealWrapper>
    </div>
  </section>
</template>

<script setup>
import { computed, inject, ref } from 'vue';
import { LOGO_ITEMS, LOGO_FILTERS } from '@/data/logos.js';
import { useApiData } from '@/composables/useApiData.js';
import { cmsApi } from '@/api/cms.js';
import { transformLogos } from '@/api/transforms.js';
import RevealWrapper from '../../ui/RevealWrapper/RevealWrapper.vue';
import s from './LogoWallSection.module.css';

const { t } = inject('i18n', { t: (k) => k });
const activeFilter = ref('all');

const apiLogos = ref([]);
useApiData(async () => {
  const data = await cmsApi.getLogos();
  return transformLogos(data);
}, apiLogos);

const displayLogos = computed(() => (apiLogos.value.length > 0 ? apiLogos.value : LOGO_ITEMS));
const displayFilters = computed(() => {
  // 根据实际数据动态生成过滤器
  const industries = new Set(['all']);
  displayLogos.value.forEach((l) => { if (l.industry) industries.add(l.industry); });
  return Array.from(industries).map((id) => {
    const existing = LOGO_FILTERS.find((f) => f.id === id);
    return existing || { id, label: id };
  });
});

const isHidden = (item) => activeFilter.value !== 'all' && item.industry !== activeFilter.value;
</script>
