<template>
  <div :class="s.section" class="reveal">
    <SectionHeader :title="t('productPage.scenarios')" align="left" />
    <TabNav
      :tabs="tabs"
      :active-index="activeIndex"
      variant="pill"
      :class="s.tabNav"
      @select="activeIndex = $event"
    />
    <div :class="s.scenarioWrap">
      <div
        v-for="(sc, i) in scenarios"
        v-show="activeIndex === i"
        :key="i"
        :class="s.scenarioCard"
      >
        <div :class="s.scenarioVisual" aria-hidden="true">
          <svg viewBox="0 0 200 160" :class="s.scenarioSvg">
            <defs>
              <linearGradient :id="`sg-${i}`" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="var(--primary-alpha-20)" />
                <stop offset="100%" stop-color="var(--primary-alpha-5)" />
              </linearGradient>
            </defs>
            <rect x="10" y="20" width="180" height="120" rx="12" :fill="`url(#sg-${i})`" />
            <circle cx="60" cy="70" r="24" fill="var(--primary-alpha-12)" />
            <rect x="100" y="50" width="70" height="8" rx="4" fill="var(--primary-alpha-12)" />
            <rect x="100" y="68" width="50" height="8" rx="4" fill="var(--primary-alpha-8)" />
            <rect x="100" y="86" width="60" height="8" rx="4" fill="var(--primary-alpha-8)" />
            <rect x="30" y="110" width="140" height="6" rx="3" fill="var(--success-alpha-10)" />
          </svg>
        </div>
        <div :class="s.scenarioBody">
          <h3 :class="s.scenarioTitle">{{ sc.title }}</h3>
          <p :class="s.scenarioDesc">{{ sc.desc }}</p>
          <div v-if="sc.metric" :class="s.metric">
            <span :class="s.metricValue">{{ sc.metric }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import SectionHeader from '@/components/ui/SectionHeader/SectionHeader.vue';
import TabNav from '@/components/ui/TabNav/TabNav.vue';
import s from './ProductScenarioTabs.vue.module.css';

const props = defineProps({ scenarios: { type: Array, default: () => [] } });
const { t } = useI18n();
const activeIndex = ref(0);

const tabs = computed(() => props.scenarios.map((sc) => ({ id: sc.title, label: sc.title })));
</script>
