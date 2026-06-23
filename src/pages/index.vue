<template>
  <main id="main-content">
    <template v-for="section in sections" :key="section.key">
      <Suspense>
        <template #fallback>
          <SectionSkeleton :height="sectionSkeletonHeight(section.key)" />
        </template>
        <component
          :is="section.component"
          v-if="section.component"
          v-bind="section.config"
        />
      </Suspense>
    </template>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ title: 'pageTitle', description: 'pageDesc' });
import { onMounted, onUnmounted, inject } from 'vue';
import { injectJsonLd, removeJsonLd } from '@/utils/jsonld.js';
import SectionSkeleton from '@/components/ui/SectionSkeleton/SectionSkeleton.vue';

// Section 骨架屏默认高度映射
const SKELETON_HEIGHTS = {
  hero: 600,
  brands: 260,
  stats: 360,
  products: 720,
  'ai-family': 680,
  industries: 640,
  testimonials: 520,
  logos: 580,
  'why-us': 760,
  resources: 620,
  'roi-calculator': 720,
  'cta-banner': 440,
};

const sectionSkeletonHeight = (key: string) => {
  return SKELETON_HEIGHTS[key as keyof typeof SKELETON_HEIGHTS] || 400;
};

const { t } = useI18n();

const { sections } = useCmsPageAsync('home');

onMounted(() => {
  injectJsonLd({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: t('hero.jsonLdName') || 'TalentPro — 用 AI 重新定义人才管理',
    description: t('hero.jsonLdDesc') || t('hero.subtitle'),
    url: 'https://talentpro.cn/',
    publisher: {
      '@type': 'Organization',
      name: 'TalentPro',
      logo: { '@type': 'ImageObject', url: 'https://talentpro.cn/logo.png' },
      sameAs: [
        'https://www.linkedin.com/company/talentpro',
        'https://twitter.com/talentpro',
      ],
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: 'https://talentpro.cn/search?q={search_term_string}' },
      'query-input': 'required name=search_term_string',
    },
  });
});
onUnmounted(removeJsonLd);
</script>
