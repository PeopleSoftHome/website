<template>
  <section :class="s.section" id="industry">
    <div class="container">
      <RevealWrapper>
        <SectionHeader
          :tag="t('industry.sectionTag')"
          :title="t('industry.sectionTitle')"
          :subtitle="t('industry.sectionSub')"
        />
      </RevealWrapper>
      <RevealWrapper>
        <TabNav
          :tabs="translatedTabs"
          :active-index="activeIndex"
          variant="pill"
          @select="trackedSelectTab"
        />
      </RevealWrapper>
      <div :class="s.panel">
        <div :class="s.features">
          <RevealWrapper v-for="(feat, i) in features" :key="feat.badge" :delay="i">
            <div :class="s.featureItem">
              <span :class="s.badge">{{ feat.badge }}</span>
              <div :class="s.featureBody">
                <strong>{{ feat.title }}</strong>
                <p>{{ feat.desc }}</p>
              </div>
            </div>
          </RevealWrapper>
          <RevealWrapper :delay="3">
            <button :class="s.cta" @click="modalStore.openModal()">{{ t('industry.getCta') }}</button>
          </RevealWrapper>
        </div>
        <RevealWrapper :delay="2" :class-name="s.screenshotWrap">
          <ProductScreenshot :screenshot="panel?.screenshot" />
        </RevealWrapper>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, inject, ref } from 'vue';

import { INDUSTRY_KEY_MAP } from '@/i18n/keyMap.js';
import { useTabs } from '@/composables/useTabs.js';
import { useCmsData, useCmsDataByKey } from '@/composables/useCmsData.js';
import { apiClient } from '@/api/client.js';
import SectionHeader from '../../ui/SectionHeader/SectionHeader.vue';
import TabNav from '../../ui/TabNav/TabNav.vue';
import ProductScreenshot from './ProductScreenshot.vue';
import RevealWrapper from '../../ui/RevealWrapper/RevealWrapper.vue';
import s from './IndustrySolutionSection.module.css';

const { t } = useI18n();
const modalStore = inject('modal', { openModal: () => {} });
const analytics = inject('analytics', { track: () => {} });
const { activeIndex, selectTab } = useTabs(0);

const originalSelectTab = selectTab;
const trackedSelectTab = (idx) => {
  originalSelectTab(idx);
  analytics.track('industry_tab_click', { tab: tabs.value?.[idx]?.id, index: idx });
};

const { displayItems: tabs, isLoading: loading } = useCmsDataByKey('industries', {
  transform: (active) => (active || []).map((item) => ({
    id: item.name
      ? item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      : `industry-${Math.random().toString(36).slice(2, 7)}`,
    label: item.name || '',
    icon: item.icon || 'factory',
    features: item.features || [],
    screenshot: item.screenshot || {},
  })),
  fallbackKey: 'industries',
});



const panel = computed(() => tabs.value[activeIndex.value]);
const indKey = computed(() => INDUSTRY_KEY_MAP[panel.value?.id] ?? panel.value?.id ?? '');

const translatedTabs = computed(() => (tabs.value || []).map((tab) => {
  const key = INDUSTRY_KEY_MAP[tab.id] ?? tab.id;
  const translated = t(`industry.tabs.${key}`);
  return {
    ...tab,
    label: translated === `industry.tabs.${key}` ? tab.label : translated,
  };
}));

const features = computed(() => {
  if (panel.value?.features && panel.value.features.length > 0) {
    return panel.value.features;
  }
  const key = indKey.value || 'manufacturing';
  return [
    { badge: t('industry.badges.f1'), title: t(`industry.${key}.f1title`), desc: t(`industry.${key}.f1desc`) },
    { badge: t('industry.badges.f2'), title: t(`industry.${key}.f2title`), desc: t(`industry.${key}.f2desc`) },
    { badge: t('industry.badges.f3'), title: t(`industry.${key}.f3title`), desc: t(`industry.${key}.f3desc`) },
  ];
});
</script>
