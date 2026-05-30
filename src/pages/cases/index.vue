<template>
  <div>

    <main :class="s.page">
      <div class="container">
        <Breadcrumb :items="[{ label: t('cases.title'), to: '/cases' }]" />

        <div :class="s.hero">
          <h1 :class="s.title">{{ t('cases.title') }}</h1>
          <p :class="s.subtitle">{{ t('cases.subtitle') }}</p>
        </div>

        <div :class="s.filter">
          <button
            v-for="ind in industries"
            :key="ind"
            :class="[s.filterBtn, activeIndustry === ind ? s.filterActive : '']"
            @click="activeIndustry = ind"
          >
            {{ ind || t('common.all') }}
          </button>
        </div>

        <div v-if="loading" :class="s.loading">{{ t('common.loading') }}</div>
        <div v-else-if="error && cases.length === 0" :class="s.error">{{ error }}</div>

        <div v-if="featuredCase" :class="s.featured">
          <NuxtLink :to="`/cases/${featuredCase.slug}`" :class="s.featuredCard">
            <div :class="s.featuredContent">
              <div :class="s.featuredHeader">
                <span :class="s.featuredBadge">{{ t('cases.featured') }}</span>
                <span :class="s.featuredIndustry">{{ featuredCase.industry }}</span>
              </div>
              <h2 :class="s.featuredTitle">{{ featuredCase.title }}</h2>
              <p :class="s.featuredExcerpt">{{ featuredCase.excerpt }}</p>
              <div :class="s.featuredMetrics">
                <div v-for="m in featuredCase.metrics" :key="m.id" :class="s.featuredMetric">
                  <span :class="s.featuredMetricValue">{{ m.value }}</span>
                  <span :class="s.featuredMetricLabel">{{ m.label }}</span>
                </div>
              </div>
            </div>
            <div :class="s.featuredVisual">
              <span>{{ featuredCase.clientName?.charAt(0) || '' }}</span>
            </div>
          </NuxtLink>
        </div>

        <div :class="s.grid">
          <NuxtLink
            v-for="c in cases"
            :key="c.id"
            :to="`/cases/${c.slug}`"
            :class="s.card"
          >
            <div :class="s.cardHeader">
              <span :class="s.cardIndustry">{{ c.industry }}</span>
              <span v-if="c.featured" :class="s.cardFeatured">{{ t('cases.featured') }}</span>
            </div>
            <h3 :class="s.cardTitle">{{ c.title }}</h3>
            <p :class="s.cardExcerpt">{{ c.excerpt }}</p>
            <div :class="s.cardMetrics">
              <div v-for="m in c.metrics" :key="m.id" :class="s.metric">
                <span :class="s.metricValue">{{ m.value }}</span>
                <span :class="s.metricLabel">{{ m.label }}</span>
              </div>
            </div>
            <div :class="s.cardFooter">
              <span :class="s.cardCta">{{ t('cases.readMore') }} →</span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </main>

  </div>
</template>

<script setup>
definePageMeta({ title: 'cases.title', description: 'cases.subtitle' });
import { ref, computed, onMounted, onUnmounted, inject } from 'vue';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb.vue';
import { caseApi } from '@/api/case.js';
import { CASES, CASE_INDUSTRIES } from '@/data/cases.js';
import { injectJsonLd, removeJsonLd } from '@/utils/jsonld.js';
import s from './CaseListView.module.css';

const { t } = inject('i18n', { t: (k) => k });

const activeIndustry = ref('');

const { data: casesRes, pending: loading, error: fetchError } = useAsyncData(
  'cases-list',
  () => {
    const params = activeIndustry.value !== '' ? { industry: activeIndustry.value } : {};
    return caseApi.getCases(params);
  },
  { server: false, watch: [activeIndustry], default: () => ({ data: [] }) }
);

const cases = computed(() => {
  if (fetchError.value) {
    if (activeIndustry.value !== '') {
      return CASES.filter((c) => c.industry === activeIndustry.value);
    }
    return CASES;
  }
  return casesRes.value?.data || [];
});
const error = computed(() => {
  if (!fetchError.value) return null;
  return fetchError.value?.response?.data?.message || fetchError.value?.message || t('common.loadError');
});

const industries = ref(CASE_INDUSTRIES);
const featuredCase = computed(() => {
  return cases.value.find((c) => c.featured) || null;
});

onMounted(() => {
  injectJsonLd({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: t('cases.jsonLdName'),
    itemListElement: CASES.slice(0, 6).map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.title,
      description: c.excerpt,
    })),
  });
});
onUnmounted(removeJsonLd);
</script>
