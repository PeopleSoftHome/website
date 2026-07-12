<template>
  <div>
    <main :class="s.page">
      <div class="container">
        <Breadcrumb :items="[{ label: t('cases.title'), to: '/cases' }, { label: caseStudy?.clientName || t('cases.detail') }]" />
        <div v-if="loading" :class="s.loading">{{ t('common.loading') }}</div>
        <div v-else-if="error && !caseStudy" :class="s.error">{{ error }}</div>
        <div v-else-if="caseStudy" :class="s.case">
          <div :class="s.hero" class="reveal">
            <div :class="s.heroBg" :style="coverStyle(caseStudy.coverImage)">
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
                <div :class="s.productIcon" :style="{ background: productMap[slug]?.iconBg, color: productMap[slug]?.iconColor }"><component :is="productMap[slug]?.icon" v-if="productMap[slug]?.icon" /></div>
                <span :class="s.productName">{{ productMap[slug]?.name || slug }}</span>
              </NuxtLink>
            </div>
          </div>
          <div v-if="relatedCases.length" :class="s.related" class="reveal">
            <h3 :class="s.relatedTitle">{{ t('cases.title') }}</h3>
            <div :class="s.relatedGrid">
              <NuxtLink v-for="c in relatedCases" :key="c.slug" :to="`/cases/${c.slug}`" :class="s.relatedCard">
                <div :class="s.relatedCover" :style="coverStyle(c.coverImage)" />
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
import { computed, type Component } from 'vue';
import { useVideoModalStore } from '@/stores/videoModal.pinia';
import { useJsonLd } from '@/utils/jsonld';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb.vue';
import StatCounter from '@/components/ui/StatCounter/StatCounter.vue';
import CaseTimeline from '@/components/sections/CaseDetail/CaseTimeline.vue';
import { caseApi } from '@/api/case';
import { getCases } from '@/data/cases';
import { getProductMap } from '@/data/products';
import { coverStyle } from '@/utils/coverStyle';
import s from './[slug].module.css';

interface ProductMapItem {
  name?: string;
  icon?: Component | string;
  iconBg?: string;
  iconColor?: string;
}

const productMap = computed(() => getProductMap(locale.value) as Record<string, ProductMapItem | undefined>);

definePageMeta({ title: 'cases.detail', description: 'cases.subtitle' });

const { t, locale } = useI18n();
const route = useRoute();
const slug = computed(() => route.params.slug);
const videoModalStore = useVideoModalStore();
const caseList = computed(() => getCases(locale.value));

interface CaseItem {
  slug: string;
  clientName: string;
  title: string;
  excerpt?: string;
  metrics?: { id?: string; label: string; value: string }[];
  timeline?: { phase: string; desc: string }[];
  products?: string[];
  relatedCases?: string[];
  teamSize?: string;
  projectDuration?: string;
  coverImage?: string;
  quote?: string;
  author?: string;
  authorTitle?: string;
  videoUrl?: string;
  industry?: string;
  scale?: string;
  [key: string]: unknown;
}

const { data: caseStudy, pending: loading, error: fetchError } = useAsyncData(
  () => `case-${locale.value}-${slug.value}`,
  async () => {
    let data: CaseItem | null = null;
    try {
      const res = await caseApi.getCase(slug.value as string);
      data = (res.data || null) as CaseItem | null;
    } catch {
      // API 失败时使用静态 fallback
    }
    const staticCase = (caseList.value as CaseItem[]).find((c) => c.slug === slug.value) || null;
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
  { default: () => null, watch: [slug, locale] }
);

useHead(() => {
  if (!caseStudy.value) return {};
  const c = caseStudy.value;
  const url = `https://talentpro.cn/cases/${route.params.slug}`;
  return {
    title: `${c.clientName} | TalentPro`,
    meta: [
      { name: 'description', content: c.excerpt || c.title },
      { property: 'og:title', content: c.title },
      { property: 'og:description', content: c.excerpt },
      { property: 'og:type', content: 'article' },
      { property: 'og:url', content: url },
      { property: 'og:image', content: c.coverImage || 'https://talentpro.cn/og-image.png' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: c.title },
      { name: 'twitter:description', content: c.excerpt },
      { name: 'twitter:image', content: c.coverImage || 'https://talentpro.cn/og-image.png' },
    ],
    link: [{ rel: 'canonical', href: url }],
  };
});

const error = computed(() => {
  if (!fetchError.value) return null;
  const err = fetchError.value as any;
  return err.response?.data?.message || err.message || t('common.loadError');
});

const relatedCases = computed<CaseItem[]>(() => {
  const slugs = caseStudy.value?.relatedCases || [];
  return slugs
    .map((slug) => (caseList.value as CaseItem[]).find((c) => c.slug === slug))
    .filter((c): c is CaseItem => Boolean(c))
    .slice(0, 3);
});

const handlePlayVideo = () => videoModalStore.openVideo();

useJsonLd(computed(() => {
  const val = caseStudy.value;
  if (!val) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: val.title,
    description: val.excerpt,
    author: { '@type': 'Organization', name: val.clientName },
    publisher: { '@type': 'Organization', name: 'TalentPro' },
  };
}));
</script>
