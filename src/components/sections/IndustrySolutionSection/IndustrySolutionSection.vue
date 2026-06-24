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

<script setup lang="ts">
import { computed, ref } from 'vue';

import { useModalStore } from '@/stores/modal.pinia';
import { useAnalyticsStore } from '@/stores/analytics.pinia';
import { INDUSTRY_KEY_MAP } from '@/i18n/keyMap';
import { useTabs } from '@/composables/useTabs';
import { useCmsDataByKey } from '@/composables/useCmsData';
import { transformIndustries } from '@/api/transforms';

import SectionHeader from '../../ui/SectionHeader/SectionHeader.vue';
import TabNav from '../../ui/TabNav/TabNav.vue';
import ProductScreenshot from './ProductScreenshot.vue';
import RevealWrapper from '../../ui/RevealWrapper/RevealWrapper.vue';
import s from './IndustrySolutionSection.module.css';

interface IndustryFeature {
  badge: string;
  title: string;
  desc: string;
}

interface IndustryTab {
  id: string;
  label: string;
  features?: IndustryFeature[];
  screenshot?: Record<string, any>;
}

const { t } = useI18n();
const modalStore = useModalStore();
const analyticsStore = useAnalyticsStore();
const { activeIndex, selectTab } = useTabs(0);

const originalSelectTab = selectTab;
const trackedSelectTab = (idx: number) => {
  originalSelectTab(idx);
  analyticsStore.track('industry_tab_click', { tab: tabs.value?.[idx]?.id, index: idx });
};

const { displayItems: rawTabs, isLoading: loading } = useCmsDataByKey('industries', {
  transform: transformIndustries,
  fallbackKey: 'industries',
});
const tabs = computed(() => rawTabs.value as unknown as IndustryTab[]);

const panel = computed(() => tabs.value[activeIndex.value]);
const indKey = computed(() => (INDUSTRY_KEY_MAP as Record<string, string>)[panel.value?.id || ''] ?? panel.value?.id ?? '');

const translatedTabs = computed(() => (tabs.value || []).map((tab) => {
  const keyMap = INDUSTRY_KEY_MAP as Record<string, string>;
  const key = keyMap[tab.id] ?? tab.id;
  const translated = t(`industry.tabs.${key}`);
  return {
    ...tab,
    label: translated === `industry.tabs.${key}` ? tab.label : translated,
  };
}));

const features = computed<IndustryFeature[]>(() => {
  if (panel.value?.features && panel.value.features.length > 0) {
    return panel.value.features;
  }
  const key = indKey.value || 'mfg';
  return [
    { badge: t('industry.badges.f1'), title: t(`industry.${key}.f1title`), desc: t(`industry.${key}.f1desc`) },
    { badge: t('industry.badges.f2'), title: t(`industry.${key}.f2title`), desc: t(`industry.${key}.f2desc`) },
    { badge: t('industry.badges.f3'), title: t(`industry.${key}.f3title`), desc: t(`industry.${key}.f3desc`) },
  ];
});
</script>
