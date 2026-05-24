<template>
  <section :class="s.section">
    <div class="container">
      <RevealWrapper>
        <h2 :class="s.title">{{ t('logoWall.title') }}</h2>
      </RevealWrapper>
      <RevealWrapper>
        <div :class="s.filters" role="group" :aria-label="t('logoWall.filterLabel')">
          <button
            v-for="f in LOGO_FILTERS"
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
            v-for="item in LOGO_ITEMS"
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
import { ref, inject } from 'vue';
import { LOGO_ITEMS, LOGO_FILTERS } from '@/data/logos.js';
import RevealWrapper from '../../ui/RevealWrapper/RevealWrapper.vue';
import s from './LogoWallSection.module.css';

const { t } = inject('i18n', { t: (k) => k });
const activeFilter = ref('all');

const isHidden = (item) => activeFilter.value !== 'all' && item.industry !== activeFilter.value;
</script>
