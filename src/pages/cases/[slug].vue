<template>
  <div>
    <main :class="s.page">
      <div class="container">
        <Breadcrumb :items="[{ label: t('cases.title'), to: '/cases' }, { label: caseStudy?.clientName || t('cases.detail') }]" />
        <div v-if="loading" :class="s.loading">{{ t('common.loading') }}</div>
        <div v-else-if="error && !caseStudy" :class="s.error">{{ error }}</div>
        <div v-else-if="caseStudy" :class="s.case">
          <div :class="s.hero" class="reveal">
            <div :class="s.heroBg" :style="{ backgroundImage: `url(${caseStudy.coverImage})` }">
              <div :class="s.heroOverlay" />
              <div :class="s.heroContent">
                <span :class="s.heroIndustry">{{ caseStudy.industry }}</span>
                <h1 :class="s.heroTitle">{{ caseStudy.title }}</h1>
                <div :class="s.heroMeta">
                  <div :class="s.heroLogo">{{ caseStudy.clientName?.[0] }}</div>
                  <div :class="s.heroMetaInfo">
                    <p :class="s.heroMetaText">{{ caseStudy.clientName }} · {{ caseStudy.industry }} · {{ caseStudy.scale || '' }}</p>
                    <div v-if="caseStudy.teamSize || caseStudy.projectDuration" :class="s.heroTags">
                      <span v-if="caseStudy.teamSize" :class="s.heroTag">{{ caseStudy.teamSize }}</span>
                      <span v-if="caseStudy.projectDuration" :class="s.heroTag">{{ caseStudy.projectDuration }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="caseStudy.metrics?.length" :class="s.metrics" class="reveal">
            <div v-for="m in caseStudy.metrics" :key="m.id" :class="s.metric">
              <StatCounter :value="m.value" :class="s.metricValue" />
              <span :class="s.metricLabel">{{ m.label }}</span>
            </div>
          </div>
          <CaseTimeline :case-study="caseStudy" />
          <div v-if="caseStudy.videoUrl" :class="s.videoTrigger" class="reveal" @click="handlePlayVideo">
            <div :class="s.videoCard"><div :class="s.playBtn" /><span :class="s.videoText">{{ t('video.title') }}</span></div>
          </div>
          <div v-if="caseStudy.quote" :class="s.testimonial" class="reveal">
            <p :class="s.quote">"{{ caseStudy.quote }}"</p>
            <div :class="s.quoteAuthor"><span :class="s.quoteName">{{ caseStudy.author }}</span><span :class="s.quoteTitle">{{ caseStudy.authorTitle }} · {{ caseStudy.clientName }}</span></div>
          </div>
          <div v-if="caseStudy.products?.length" :class="s.products" class="reveal">
            <h3 :class="s.productsTitle">{{ t('cases.usedProducts') }}</h3>
            <div :class="s.productsGrid">
              <NuxtLink v-for="slug in caseStudy.products" :key="slug" :to="`/products/${slug}`" :class="s.productCard">
                <div :class="s.productIcon" :style="{ background: PRODUCT_MAP[slug]?.iconBg, color: PRODUCT_MAP[slug]?.iconColor }"><component :is="PRODUCT_MAP[slug]?.icon" v-if="PRODUCT_MAP[slug]?.icon" /></div>
                <span :class="s.productName">{{ PRODUCT_MAP[slug]?.name || slug }}</span>
              </NuxtLink>
            </div>
          </div>
          <div v-if="relatedCases.length" :class="s.related" class="reveal">
            <h3 :class="s.relatedTitle">{{ t('cases.title') }}</h3>
            <div :class="s.relatedGrid">
              <NuxtLink v-for="c in relatedCases" :key="c.slug" :to="`/cases/${c.slug}`" :class="s.relatedCard">
                <img :src="c.coverImage" :alt="c.clientName" :class="s.relatedCover" />
                <div :class="s.relatedInfo"><span :class="s.relatedClient">{{ c.clientName }}</span><p :class="s.relatedTitle2">{{ c.title }}</p></div>
              </NuxtLink>
            </div>
          </div>
        </div>
        <div v-else :class="s.empty">{{ t('cases.notFound') }}</div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue';
import { useVideoModalStore } from '@/stores/videoModal.pinia.js';
import { injectJsonLd, removeJsonLd } from '@/utils/jsonld.js';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb.vue';
import StatCounter from '@/components/ui/StatCounter/StatCounter.vue';
import CaseTimeline from '@/components/sections/CaseDetail/CaseTimeline.vue';
import { caseApi } from '@/api/case.js';
import { CASES } from '@/data/cases.js';
import { PRODUCT_MAP } from '@/data/products.js';
import s from './[slug].vue.module.css';

definePageMeta({ title: 'cases.detail', description: 'cases.subtitle' });

const { t } = useI18n();
const route = useRoute();
const slug = computed(() => route.params.slug);
const videoModalStore = useVideoModalStore();

const { data: caseStudy, pending: loading, error: fetchError } = useAsyncData(
  () => `case-${slug.value}`,
  async () => {
    let data = null;
    try {
      const res = await caseApi.getCase(slug.value);
      data = res.data || null;
    } catch {
      // API 失败时使用静态 fallback
    }
    const staticCase = CASES.find((c) => c.slug === slug.value) || null;
    if (!data && !staticCase) {
      throw createError({ statusCode: 404, statusMessage: 'Case Study Not Found', fatal: true });
    }
    if (data && staticCase) {
      return {
        ...staticCase,
        ...data,
        metrics: data.metrics?.length ? data.metrics : staticCase.metrics,
        timeline: staticCase.timeline,
        products: staticCase.products,
        relatedCases: staticCase.relatedCases,
        teamSize: staticCase.teamSize,
        projectDuration: staticCase.projectDuration,
      };
    }
    return data || staticCase;
  },
  { server: false, default: () => null, watch: [slug] }
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

const relatedCases = computed(() => {
  const slugs = caseStudy.value?.relatedCases || [];
  return slugs.map((slug) => CASES.find((c) => c.slug === slug)).filter(Boolean).slice(0, 3);
});

const handlePlayVideo = () => videoModalStore.openVideo();

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
