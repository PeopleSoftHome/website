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
          @select="selectTab"
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
import { computed, inject } from 'vue';
import { INDUSTRY_TABS } from '@/data/industries.js';
import { INDUSTRY_KEY_MAP } from '@/i18n/keyMap.js';
import { useTabs } from '@/composables/useTabs.js';
import SectionHeader from '../../ui/SectionHeader/SectionHeader.vue';
import TabNav from '../../ui/TabNav/TabNav.vue';
import ProductScreenshot from './ProductScreenshot.vue';
import RevealWrapper from '../../ui/RevealWrapper/RevealWrapper.vue';
import s from './IndustrySolutionSection.module.css';

const { t } = inject('i18n', { t: (k) => k });
const modalStore = inject('modal', { openModal: () => {} });
const { activeIndex, selectTab } = useTabs(0);

const panel = computed(() => INDUSTRY_TABS[activeIndex.value]);
const indKey = computed(() => INDUSTRY_KEY_MAP[panel.value.id] ?? panel.value.id);

const translatedTabs = computed(() => INDUSTRY_TABS.map(tab => ({
  ...tab,
  label: t(`industry.tabs.${INDUSTRY_KEY_MAP[tab.id] ?? tab.id}`),
})));

const features = computed(() => [
  { badge: t('industry.badges.f1'), title: t(`industry.${indKey.value}.f1title`), desc: t(`industry.${indKey.value}.f1desc`) },
  { badge: t('industry.badges.f2'), title: t(`industry.${indKey.value}.f2title`), desc: t(`industry.${indKey.value}.f2desc`) },
  { badge: t('industry.badges.f3'), title: t(`industry.${indKey.value}.f3title`), desc: t(`industry.${indKey.value}.f3desc`) },
]);
</script>
