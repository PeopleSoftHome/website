<template>
  <div>
    <main :class="s.page">
      <div class="container">
        <Breadcrumb :items="[{ label: t('cases.title'), to: '/cases' }]" />

        <div :class="s.hero" class="reveal">
          <h1 :class="s.title">{{ t('cases.title') }}</h1>
          <p :class="s.subtitle">{{ t('cases.subtitle') }}</p>
        </div>

        <div :class="s.filter" class="reveal reveal-delay-1">
          <TabNav
            :tabs="tabItems"
            :active-index="activeIndex"
            variant="pill"
            @select="onSelectIndustry"
          />
        </div>

        <div v-if="loading" :class="s.loading">{{ t('common.loading') }}</div>
        <div v-else-if="error && cases.length === 0" :class="s.error">{{ error }}</div>

        <div v-if="featuredCase" :class="s.featured" class="reveal">
          <NuxtLink :to="`/cases/${featuredCase.slug}`" :class="s.featuredCard">
            <div
              :class="s.featuredBg"
              :style="coverStyle(featuredCase.coverImage)"
            />
            <div :class="s.featuredOverlay" />
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
          </NuxtLink>
        </div>

        <div :class="s.grid">
          <NuxtLink
            v-for="(c, idx) in displayedCases"
            :key="c.id"
            :to="`/cases/${c.slug}`"
            :class="[s.card, s.cardEnter]"
            :style="{ '--stagger': idx }"
          >
            <div
              v-if="c.coverImage"
              :class="s.cardCover"
              :style="coverStyle(c.coverImage)"
            />
            <div :class="s.cardBody">
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
            </div>
          </NuxtLink>
        </div>

        <div v-if="hasMore" :class="s.loadMoreWrap">
          <button :class="s.loadMoreBtn" @click="loadMore">
            {{ t('common.loadMore') }}
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ title: 'cases.title', description: 'cases.subtitle' });
import { ref, computed, onMounted, onUnmounted } from 'vue';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb.vue';
import TabNav from '@/components/ui/TabNav/TabNav.vue';
import { caseApi } from '@/api/case';
import { getCases, getCaseIndustries } from '@/data/cases';
import { injectJsonLd, removeJsonLd } from '@/utils/jsonld';
import { coverStyle } from '@/utils/coverStyle';
import { usePageSeo } from '@/composables/usePageSeo';
import s from './index.module.css';

const { t, locale } = useI18n();
usePageSeo({ title: t('cases.title'), description: t('cases.subtitle'), path: '/cases' });

const activeIndustry = ref('');
const displayLimit = ref(6);
const PAGE_SIZE = 6;

const caseList = computed(() => getCases(locale.value));
const industries = computed(() => getCaseIndustries(locale.value));

const tabItems = computed(() => industries.value.map((ind) => ({
  id: ind || 'all',
  label: ind || t('common.all'),
})));
const activeIndex = computed(() => industries.value.findIndex((ind) => ind === activeIndustry.value));
function onSelectIndustry(index: number) {
  activeIndustry.value = industries.value[index] || '';
  displayLimit.value = PAGE_SIZE;
}

watch(locale, () => {
  activeIndustry.value = '';
});

const { data: casesRes, pending: loading, error: fetchError } = useAsyncData(
  () => `cases-list-${locale.value}`,
  () => {
    const params = activeIndustry.value !== '' ? { industry: activeIndustry.value } : {};
    return caseApi.getCases(params);
  },
  { server: false, watch: [activeIndustry, locale], default: () => ({ data: [] }) }
);

const cases = computed(() => {
  const apiData = casesRes.value?.data;
  const hasApiData = Array.isArray(apiData) && apiData.length > 0;
  if (fetchError.value || !hasApiData) {
    if (activeIndustry.value !== '') {
      return caseList.value.filter((c) => c.industry === activeIndustry.value);
    }
    return caseList.value;
  }
  return apiData;
});
const error = computed(() => {
  if (!fetchError.value) return null;
  const err = fetchError.value as any;
  return err.response?.data?.message || err.message || t('common.loadError');
});

const featuredCase = computed(() => {
  return cases.value.find((c) => c.featured) || null;
});

const displayedCases = computed(() => cases.value.slice(0, displayLimit.value));
const hasMore = computed(() => cases.value.length > displayLimit.value);

function loadMore() {
  displayLimit.value += PAGE_SIZE;
}

onMounted(() => {
  injectJsonLd({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: t('cases.jsonLdName'),
    itemListElement: caseList.value.slice(0, 6).map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.title,
      description: c.excerpt,
    })),
  });
});
onUnmounted(removeJsonLd);
</script>
