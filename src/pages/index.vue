<template>
  <main id="main-content">
    <template v-for="section in sectionComponents" :key="section.key">
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
import { computed } from 'vue';
import { useJsonLd } from '@/shared/utils/jsonld';
import SectionSkeleton from '@/components/ui/SectionSkeleton/SectionSkeleton.vue';
import { resolveSectionComponent } from '@/composables/useCmsPageAsync';

// P0: homepage is a narrative, not a catalog. Keep the primary story to six scenes.
const P0_HOME_SCENES = [
  'hero',
  'brands',
  'stats',
  'ai-family',
  'testimonials',
  'cta-banner',
] as const;

const SKELETON_HEIGHTS = {
  hero: 600,
  brands: 220,
  stats: 320,
  products: 680,
  'ai-family': 680,
  industries: 620,
  testimonials: 520,
  logos: 520,
  'why-us': 720,
  resources: 600,
  'roi-calculator': 700,
  'cta-banner': 400,
};

const sectionSkeletonHeight = (key: string) => {
  return SKELETON_HEIGHTS[key as keyof typeof SKELETON_HEIGHTS] || 400;
};

const { t } = useI18n();
const { sections } = useCmsPageAsync('home');

const sectionComponents = computed(() => {
  const cmsSections = sections.value || [];
  const selected = new Map(cmsSections.map((section) => [section.key, section]));

  return P0_HOME_SCENES.map((key) => {
    const section = selected.get(key);
    if (!section) return null;
    return {
      ...section,
      component: resolveSectionComponent(section.key),
    };
  }).filter(Boolean) as Array<{ key: string; component: unknown; config?: Record<string, unknown> }>;
});

useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: t('hero.jsonLdName') || 'TalentPro — Redefine Talent Management with AI',
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
</script>
