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
            {{ t(f.label) }}
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

<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import { getLogoFilters } from '@/data/logos';
import { useCmsDataByKey } from '@/composables/useCmsData';

import RevealWrapper from '../../ui/RevealWrapper/RevealWrapper.vue';
import s from './LogoWallSection.module.css';

interface LogoItem {
  id: string;
  name: string;
  initial: string;
  brandColor: string;
  industry: string;
}

const { t, locale } = useI18n();
const activeFilter = ref('all');

const LOGO_FILTERS = computed(() => getLogoFilters(locale.value));

const { displayItems: rawDisplayLogos, isLoading: loading } = useCmsDataByKey('logos', {
  transform: (active: unknown[]) => (active || []).map((item: any) => ({
    id: item.name
      ? item.name.toLowerCase().replace(/\s+/g, '-')
      : `logo-${Math.random().toString(36).slice(2, 7)}`,
    name: item.name,
    initial: item.name ? item.name.charAt(0) : '?',
    brandColor: '#1B5FEB',
    industry: item.industry || 'all',
  })),
  fallbackKey: 'logos',
});
const displayLogos = computed(() => rawDisplayLogos.value as unknown as LogoItem[]);

const INDUSTRY_LABEL_MAP: Record<string, string> = {
  all: 'logoWall.filterAll',
  '先进制造': 'logoWall.industries.mfg',
  '消费零售': 'logoWall.industries.retail',
  '互联网': 'logoWall.industries.internet',
  '新能源': 'logoWall.industries.energy',
  '金融': 'logoWall.industries.finance',
};

const displayFilters = computed(() => {
  const industries = new Set<string>(['all']);
  (displayLogos.value || []).forEach((l) => {
    if (l.industry) industries.add(l.industry);
  });
  return Array.from(industries).map((id) => {
    const existing = LOGO_FILTERS.value.find((f) => f.id === id);
    return existing || { id, label: INDUSTRY_LABEL_MAP[id] || id };
  });
});

const isHidden = (item: LogoItem) => activeFilter.value !== 'all' && item.industry !== activeFilter.value;
</script>
