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
import { LOGO_FILTERS } from '@/data/logos.js';
import { useCmsData, useCmsDataByKey } from '@/composables/useCmsData.js';
import { apiClient } from '@/api/client.js';
import RevealWrapper from '../../ui/RevealWrapper/RevealWrapper.vue';
import s from './LogoWallSection.module.css';

const { t } = useI18n();
const activeFilter = ref('all');

const { displayItems: displayLogos, isLoading: loading } = useCmsDataByKey('logos', {
  transform: (active) => (active || []).map((item) => ({
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


const displayFilters = computed(() => {
  const industries = new Set(['all']);
  (displayLogos.value || []).forEach((l) => {
    if (l.industry) industries.add(l.industry);
  });
  return Array.from(industries).map((id) => {
    const existing = LOGO_FILTERS.find((f) => f.id === id);
    return existing || { id, label: id };
  });
});

const isHidden = (item) => activeFilter.value !== 'all' && item.industry !== activeFilter.value;
</script>
