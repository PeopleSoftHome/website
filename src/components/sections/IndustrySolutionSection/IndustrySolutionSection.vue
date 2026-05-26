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
          <ProductScreenshot :screenshot="panel.screenshot" />
        </RevealWrapper>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, inject, ref } from 'vue';
import { INDUSTRY_TABS } from '@/data/industries.js';
import { INDUSTRY_KEY_MAP } from '@/i18n/keyMap.js';
import { useTabs } from '@/composables/useTabs.js';
import { useApiData } from '@/composables/useApiData.js';
import { cmsApi } from '@/api/cms.js';
import { transformIndustries } from '@/api/transforms.js';
import SectionHeader from '../../ui/SectionHeader/SectionHeader.vue';
import TabNav from '../../ui/TabNav/TabNav.vue';
import ProductScreenshot from './ProductScreenshot.vue';
import RevealWrapper from '../../ui/RevealWrapper/RevealWrapper.vue';
import s from './IndustrySolutionSection.module.css';

const { t } = inject('i18n', { t: (k) => k });
const modalStore = inject('modal', { openModal: () => {} });
const analytics = inject('analytics', { track: () => {} });
const { activeIndex, selectTab } = useTabs(0);

const originalSelectTab = selectTab;
const trackedSelectTab = (idx) => {
  originalSelectTab(idx);
  analytics.track('industry_tab_click', { tab: tabs.value[idx]?.id, index: idx });
};

// API 数据（fallback 为静态数据）
const apiIndustries = ref([]);
useApiData(async () => {
  const data = await cmsApi.getIndustries();
  return transformIndustries(data);
}, apiIndustries);

const tabs = computed(() => (apiIndustries.value.length > 0 ? apiIndustries.value : INDUSTRY_TABS));

const panel = computed(() => tabs.value[activeIndex.value]);
const indKey = computed(() => INDUSTRY_KEY_MAP[panel.value.id] ?? panel.value.id);

const translatedTabs = computed(() => tabs.value.map(tab => ({
  ...tab,
  label: t(`industry.tabs.${INDUSTRY_KEY_MAP[tab.id] ?? tab.id}`),
})));

const features = computed(() => {
  // 优先使用 API 返回的 features（如果有）
  if (panel.value.features && panel.value.features.length > 0) {
    return panel.value.features;
  }
  // 回退到 i18n
  return [
    { badge: t('industry.badges.f1'), title: t(`industry.${indKey.value}.f1title`), desc: t(`industry.${indKey.value}.f1desc`) },
    { badge: t('industry.badges.f2'), title: t(`industry.${indKey.value}.f2title`), desc: t(`industry.${indKey.value}.f2desc`) },
    { badge: t('industry.badges.f3'), title: t(`industry.${indKey.value}.f3title`), desc: t(`industry.${indKey.value}.f3desc`) },
  ];
});
</script>
