<template>
  <section :class="s.section" id="whyus">
    <div class="container">
      <RevealWrapper :class-name="s.header">
        <h2 :class="s.title">{{ t('whyUs.sectionTitle') }}</h2>
        <p :class="s.subtitle">{{ t('whyUs.sectionSub') }}</p>
      </RevealWrapper>
      <RevealWrapper>
        <TabNav :tabs="tabs" :active-index="activeIndex" variant="underline" @select="selectTab" />
      </RevealWrapper>
      <div :class="s.grid" :key="currentTabId">
        <MetricCard
          v-for="(m, i) in currentMetrics"
          :key="m.label"
          :num="m.num"
          :label="m.label"
          :desc="m.desc"
          :delay="i"
        />
      </div>
      <RevealWrapper :class-name="s.statsBar">
        <div
          v-for="(item, i) in STATS_BAR"
          :key="i"
          :class="[s.statItem, i === STATS_BAR.length - 1 ? s.statLast : '']"
        >
          <div :class="s.statNum">
            <span ref="el => { if(el) barRefs[i] = el }">0</span>
            <span :class="s.statSuffix">{{ item.suffix }}</span>
          </div>
          <div :class="s.statLabel">{{ t(`whyUs.statsBar.${i}.label`) }}</div>
        </div>
      </RevealWrapper>
      <RevealWrapper :class-name="s.certSection">
        <div :class="s.certTitle">{{ t('whyUs.security.title') }}</div>
        <div :class="s.certList">
          <div v-for="(cert, i) in SECURITY_CERTS" :key="cert.id" :class="s.certBadge">
            <span><Icon :name="cert.icon" :size="16" /></span>
            <span :class="s.certLabel">{{ certLabel(i) }}</span>
            <span :class="s.certDesc">{{ certDesc(i) }}</span>
          </div>
        </div>
      </RevealWrapper>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, inject, onMounted } from 'vue';
import { useTabs } from '@/composables/useTabs.js';
import { useCmsDataByKey } from '@/composables/useCmsData.js';
import { transformWhyUsTabs } from '@/api/transforms.js';
import { STATS_BAR, WHY_US_TABS } from '@/data/whyUs.js';
import { SECURITY_CERTS } from '@/data/security.js';
import Icon from '../../ui/Icon/Icon.vue';
import TabNav from '../../ui/TabNav/TabNav.vue';
import MetricCard from './MetricCard.vue';
import RevealWrapper from '../../ui/RevealWrapper/RevealWrapper.vue';
import s from './WhyUsSection.module.css';

const { t } = useI18n();
const { activeIndex, selectTab } = useTabs(0);

const { displayItems: apiTabs } = useCmsDataByKey('why-us', { transform: transformWhyUsTabs, fallbackKey: 'why-us' });

const staticTabs = [
  { id: 'product', label: t('whyUs.tabs.product') },
  { id: 'brand', label: t('whyUs.tabs.brand') },
  { id: 'success', label: t('whyUs.tabs.success') },
];

const tabs = computed(() => ((apiTabs.value || []).length > 0 ? apiTabs.value.map((t) => ({ id: t.id, label: t.label })) : staticTabs));
const currentTabId = computed(() => tabs.value[activeIndex.value]?.id || 'product');

const currentMetrics = computed(() => {
  const apiTab = apiTabs.value[activeIndex.value];
  if (apiTab?.metrics?.length) return apiTab.metrics;
  const staticTab = WHY_US_TABS.find((tab) => tab.id === currentTabId.value);
  return staticTab?.metrics || [];
});

const barRefs = [];
onMounted(() => {
  STATS_BAR.forEach((item, i) => {
    const el = barRefs[i];
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !el.dataset.done) {
          el.dataset.done = '1';
          const start = performance.now();
          const duration = 1800;
          const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * item.target);
            el.textContent = current.toLocaleString();
            if (progress < 1) requestAnimationFrame(tick);
            else el.textContent = item.target.toLocaleString();
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
  });
});

const certLabel = (i) => SECURITY_CERTS[i]?.label || '';
const certDesc = (i) => SECURITY_CERTS[i]?.desc || '';
</script>
