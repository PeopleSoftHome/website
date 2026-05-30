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
          <div :class="s.hero">
            <span :class="s.industry">{{ caseStudy.industry }}</span>
            <h1 :class="s.title">{{ caseStudy.title }}</h1>
            <p :class="s.meta">{{ caseStudy.clientName }} · {{ caseStudy.industry }} · {{ caseStudy.scale || '' }}</p>
          </div>

          <div v-if="caseStudy.metrics?.length" :class="s.metrics">
            <div v-for="m in caseStudy.metrics" :key="m.id" :class="s.metric">
              <span :class="s.metricValue">{{ m.value }}</span>
              <span :class="s.metricLabel">{{ m.label }}</span>
            </div>
          </div>

          <div :class="s.story">
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

          <div v-if="caseStudy.quote" :class="s.testimonial">
            <p :class="s.quote">"{{ caseStudy.quote }}"</p>
            <div :class="s.quoteAuthor">
              <span :class="s.quoteName">{{ caseStudy.author }}</span>
              <span :class="s.quoteTitle">{{ caseStudy.authorTitle }} · {{ caseStudy.clientName }}</span>
            </div>
          </div>

          <div v-if="caseStudy.products?.length" :class="s.products">
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
import { ref, onMounted, onUnmounted, inject } from 'vue';
import { removeJsonLd } from '@/utils/jsonld.js';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb.vue';
import { caseApi } from '@/api/case.js';
import { CASES } from '@/data/cases.js';
import { PRODUCT_MAP } from '@/data/products.js';
import s from './CaseDetailView.module.css';

const { t } = inject('i18n', { t: (k) => k });
const route = useRoute();
const caseStudy = ref(null);
const loading = ref(false);
const error = ref(null);

const productName = (slug) => {
  return PRODUCT_MAP[slug]?.name || slug;
};

const fetchCase = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await caseApi.getCase(route.params.slug);
    caseStudy.value = res.data || null;
  } catch (e) {
    error.value = e.response?.data?.message || t('common.loadError');
    caseStudy.value = CASES.find((c) => c.slug === route.params.slug) || null;
  }
  loading.value = false;
  if (caseStudy.value) {
    document.title = `${caseStudy.value.clientName} | ${t('cases.title')}`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', `${caseStudy.value.clientName} | ${t('cases.title')}`);
  }
};

onMounted(fetchCase);
onUnmounted(removeJsonLd);
</script>
