<template>
  <div>

    <main :class="s.page">
      <div class="container">
        <Breadcrumb :items="[{ label: t('solutions.title'), to: '/solutions' }]" />

        <div :class="s.hero" class="reveal">
          <h1 :class="s.title">{{ t('solutions.title') }}</h1>
          <p :class="s.subtitle">{{ t('solutions.subtitle') }}</p>
        </div>

        <div :class="s.grid" class="reveal reveal-delay-1">
          <NuxtLink
            v-for="industry in industries"
            :key="industry.slug"
            :to="`/solutions/${industry.slug}`"
            :class="s.card"
          >
            <div :class="s.cardHeader">
              <div :class="s.cardIcon">{{ industry.icon }}</div>
              <span :class="s.cardBadge">{{ industry.features?.length || 0 }} {{ t('solutions.features') }}</span>
            </div>
            <h3 :class="s.cardTitle">{{ industry.heroTitle || industry.label + t('solutions.suffix') }}</h3>
            <p :class="s.cardDesc">{{ industry.heroDesc?.slice(0, 120) }}...</p>
            <div :class="s.cardStats">
              <div v-for="(st, i) in (industry.stats?.slice(0, 3) || [])" :key="i" :class="s.stat">
                <span :class="s.statValue">{{ st.value }}</span>
                <span :class="s.statLabel">{{ st.label }}</span>
              </div>
            </div>
            <div :class="s.cardFooter">
              <span :class="s.cardCta">{{ t('solutions.learnMore') }} →</span>
            </div>
          </NuxtLink>
        </div>

        <div :class="s.ctaBand" class="reveal">
          <h3 :class="s.ctaTitle">{{ t('solutions.ctaTitle') }}</h3>
          <p :class="s.ctaDesc">{{ t('solutions.ctaDesc') }}</p>
          <button :class="s.ctaBtn" @click="modalStore.openModal()">{{ t('solutions.demoCta') }}</button>
        </div>
      </div>
    </main>

  </div>
</template>

<script setup>
definePageMeta({ title: 'solutions.title', description: 'solutions.subtitle' });
import { onUnmounted } from 'vue';
import { useModalStore } from '@/stores/modal.pinia.js';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb.vue';
import { INDUSTRY_TABS } from '@/data/industries.js';
import { removeJsonLd } from '@/utils/jsonld.js';
import s from './index.vue.module.css';

const { t } = useI18n();
const modalStore = useModalStore();
const industries = INDUSTRY_TABS;
onUnmounted(removeJsonLd);
</script>
