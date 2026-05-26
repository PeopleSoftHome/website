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
      <div :class="s.grid" :key="TAB_KEYS[activeIndex]">
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
import { STATS_BAR } from '@/data/whyUs.js';
import { SECURITY_CERTS } from '@/data/security.js';
import Icon from '../../ui/Icon/Icon.vue';
import TabNav from '../../ui/TabNav/TabNav.vue';
import MetricCard from './MetricCard.vue';
import RevealWrapper from '../../ui/RevealWrapper/RevealWrapper.vue';
import s from './WhyUsSection.module.css';

const { t } = inject('i18n', { t: (k) => k });
const { activeIndex, selectTab } = useTabs(0);

const TAB_KEYS = ['product', 'brand', 'success'];

const tabs = computed(() => TAB_KEYS.map(k => ({ id: k, label: t(`whyUs.tabs.${k}`) })));
const currentMetrics = computed(() => {
  const m = t(`whyUs.metrics.${TAB_KEYS[activeIndex.value]}`);
  return Array.isArray(m) ? m : [];
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

const certLabel = (i) => {
  const data = t(`whyUs.security.certs.${i}`);
  return typeof data === 'object' ? data.label : SECURITY_CERTS[i].label;
};
const certDesc = (i) => {
  const data = t(`whyUs.security.certs.${i}`);
  return typeof data === 'object' ? data.desc : SECURITY_CERTS[i].desc;
};
</script>
