<template>
  <div>

    <main :class="s.page">
      <div class="container">
        <Breadcrumb :items="[
          { label: t('cases.title'), to: '/cases' },
          { label: caseStudy?.clientName || t('cases.detail') },
        ]" />

        <div v-if="loading" :class="s.loading">{{ t('common.loading') }}</div>
        <div v-else-if="error && !caseStudy" :class="s.error">{{ error }}</div>

        <div v-else-if="caseStudy" :class="s.case">
          <div :class="s.hero" class="reveal">
            <span :class="s.industry">{{ caseStudy.industry }}</span>
            <h1 :class="s.title">{{ caseStudy.title }}</h1>
            <p :class="s.meta">{{ caseStudy.clientName }} · {{ caseStudy.industry }} · {{ caseStudy.scale || '' }}</p>
          </div>

          <div v-if="caseStudy.metrics?.length" :class="s.metrics" class="reveal">
            <div v-for="m in caseStudy.metrics" :key="m.id" :class="s.metric">
              <span :class="s.metricValue">{{ m.value }}</span>
              <span :class="s.metricLabel">{{ m.label }}</span>
            </div>
          </div>

          <div :class="s.story" class="reveal">
            <div :class="s.storySection">
              <h2 :class="s.storyTitle">{{ t('cases.challenge') }}</h2>
              <p :class="s.storyBody">{{ caseStudy.challenge }}</p>
            </div>
            <div :class="s.storySection">
              <h2 :class="s.storyTitle">{{ t('cases.solution') }}</h2>
              <p :class="s.storyBody">{{ caseStudy.solution }}</p>
            </div>
            <div :class="s.storySection">
              <h2 :class="s.storyTitle">{{ t('cases.results') }}</h2>
              <p :class="s.storyBody">{{ caseStudy.results }}</p>
            </div>
          </div>

          <div v-if="caseStudy.quote" :class="s.testimonial" class="reveal">
            <p :class="s.quote">"{{ caseStudy.quote }}"</p>
            <div :class="s.quoteAuthor">
              <span :class="s.quoteName">{{ caseStudy.author }}</span>
              <span :class="s.quoteTitle">{{ caseStudy.authorTitle }} · {{ caseStudy.clientName }}</span>
            </div>
          </div>

          <div v-if="caseStudy.products?.length" :class="s.products" class="reveal">
            <h3 :class="s.productsTitle">{{ t('cases.usedProducts') }}</h3>
            <div :class="s.productsList">
              <NuxtLink
                v-for="slug in caseStudy.products"
                :key="slug"
                :to="`/products/${slug}`"
                :class="s.productLink"
              >
                {{ productName(slug) }}
              </NuxtLink>
            </div>
          </div>
        </div>

        <div v-else :class="s.empty">{{ t('cases.notFound') }}</div>
      </div>
    </main>

  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, watch } from 'vue';
import { injectJsonLd, removeJsonLd } from '@/utils/jsonld.js';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb.vue';
import { caseApi } from '@/api/case.js';
import { CASES } from '@/data/cases.js';
import { PRODUCT_MAP } from '@/data/products.js';
import s from './[slug].vue.module.css';

definePageMeta({ title: 'cases.detail', description: 'cases.subtitle' });

const { t } = useI18n();
const route = useRoute();

const { data: caseStudy, pending: loading, error: fetchError } = useAsyncData(
  `case-${route.params.slug}`,
  async () => {
    try {
      const res = await caseApi.getCase(route.params.slug);
      return res.data || null;
    } catch {
      return CASES.find((c) => c.slug === route.params.slug) || null;
    }
  },
  { server: false, default: () => null }
);

useHead(() => {
  if (!caseStudy.value) return {};
  const c = caseStudy.value;
  return {
    title: `${c.clientName} | TalentPro`,
    meta: [
      { name: 'description', content: c.excerpt || c.title },
      { property: 'og:title', content: c.title },
      { property: 'og:description', content: c.excerpt },
    ],
  };
});

const error = computed(() => {
  if (!fetchError.value) return null;
  return fetchError.value.response?.data?.message || fetchError.value.message || t('common.loadError');
});

const productName = (slug) => {
  return PRODUCT_MAP[slug]?.name || slug;
};

onMounted(() => {
  watch(caseStudy, (val) => {
    if (val) {
      injectJsonLd({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: val.title,
        description: val.excerpt,
        author: { '@type': 'Organization', name: val.clientName },
        publisher: { '@type': 'Organization', name: 'TalentPro' },
      });
    }
  }, { immediate: true });
});

onUnmounted(removeJsonLd);
</script>
