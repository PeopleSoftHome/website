<template>
  <div>
    <main :class="s.page">
      <div class="container">
        <Breadcrumb :items="[
          { label: t('solutions.title'), to: '/solutions' },
          { label: industry?.label || t('solutions.detail') },
        ]" />

        <div v-if="industry" :class="s.hero" class="reveal">
          <div :class="s.heroContent">
            <h1 :class="s.title">{{ industry.heroTitle }}</h1>
            <p :class="s.desc">{{ industry.heroDesc }}</p>
            <button :class="s.cta" @click="modalStore.openModal()">{{ t('solutions.demoCta') }}</button>
          </div>
          <div :class="s.heroStats">
            <div v-for="(st, i) in industry.stats" :key="i" :class="s.stat">
              <span :class="s.statValue"><StatCounter :value="st.value" /></span>
              <span :class="s.statLabel">{{ st.label }}</span>
            </div>
          </div>
        </div>

        <SolutionPainCompare
          v-if="industry"
          :pain-points="industry.painPoints"
          :solutions="industry.architecture"
        />

        <div v-if="industry?.features?.length" :class="s.section" class="reveal">
          <h2 :class="s.sectionTitle">{{ t('solutions.keyFeatures') }}</h2>
          <div :class="s.featureGrid">
            <div v-for="(f, i) in industry.features" :key="i" :class="s.featureCard">
              <span :class="s.featureBadge">{{ f.badge }}</span>
              <h3 :class="s.featureTitle">{{ f.title }}</h3>
              <p :class="s.featureDesc">{{ f.desc }}</p>
            </div>
          </div>
        </div>

        <div v-if="industry?.roadmap?.length" :class="s.section" class="reveal">
          <h2 :class="s.sectionTitle">{{ t('solutions.roadmap') }}</h2>
          <div :class="s.roadmapTimeline">
            <div v-for="(r, i) in industry.roadmap" :key="i" :class="s.roadmapItem" class="reveal">
              <div :class="s.roadmapLeft">
                <div :class="s.roadmapPhase">{{ r.phase }}</div>
                <div v-if="i < industry.roadmap.length - 1" :class="s.roadmapLine" />
              </div>
              <div :class="s.roadmapRight">
                <h3>{{ r.title }}</h3>
                <p>{{ r.desc }}</p>
              </div>
            </div>
          </div>
        </div>

        <SolutionCaseDeep
          v-if="industry"
          :case-study="industry.caseStudy"
          :roi="industry.roi"
        />

        <div v-if="!industry" :class="s.empty">{{ t('solutions.notFound') }}</div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue';
import { useModalStore } from '@/stores/modal.pinia';
import { injectJsonLd, removeJsonLd } from '@/utils/jsonld';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb.vue';
import StatCounter from '@/components/ui/StatCounter/StatCounter.vue';
import SolutionPainCompare from '@/components/sections/SolutionDetail/SolutionPainCompare.vue';
import SolutionCaseDeep from '@/components/sections/SolutionDetail/SolutionCaseDeep.vue';
import { getIndustryMap } from '@/data/industries/map';
import { cmsApi } from '@/api/cms';
import s from './[slug].module.css';

interface RoadmapItem {
  phase: string;
  title: string;
  desc: string;
}

interface StatItem {
  value: string;
  label: string;
}

interface PainPoint {
  title: string;
  desc: string;
}

interface SolutionItem {
  title: string;
  desc: string;
}

interface FeatureItem {
  badge: string;
  title: string;
  desc: string;
}

interface RoiItem {
  metric: string;
  value: string;
  desc: string;
}

interface IndustryDetail {
  slug?: string;
  label?: string;
  icon?: string;
  features?: FeatureItem[];
  screenshot?: string;
  heroTitle?: string;
  heroDesc?: string;
  painPoints?: PainPoint[];
  architecture?: SolutionItem[];
  roadmap?: RoadmapItem[];
  caseStudy?: Record<string, unknown>;
  roi?: RoiItem[];
  stats?: StatItem[];
}

function mergeIndustry(cms: Partial<IndustryDetail> | null, fallback: Partial<IndustryDetail> | null): IndustryDetail | null {
  if (!cms && !fallback) return null;
  const base = fallback || {};
  return {
    ...base,
    ...cms,
    label: cms?.label ?? base.label,
    icon: base.icon || cms?.icon,
    features: cms?.features?.length ? cms.features : base.features,
    screenshot: cms?.screenshot ? cms.screenshot : base.screenshot,
    heroTitle: base.heroTitle || cms?.heroTitle,
    heroDesc: base.heroDesc || cms?.heroDesc,
    painPoints: base.painPoints || cms?.painPoints,
    architecture: base.architecture || cms?.architecture,
    roadmap: base.roadmap || cms?.roadmap,
    caseStudy: base.caseStudy || cms?.caseStudy,
    roi: base.roi || cms?.roi,
    stats: base.stats || cms?.stats,
  };
}

definePageMeta({ title: 'solutions.detail', description: 'solutions.subtitle' });

const { t, locale } = useI18n();
const route = useRoute();
const slug = computed(() => route.params.slug);
const modalStore = useModalStore();

const slugStr = computed(() => Array.isArray(slug.value) ? slug.value[0] : slug.value);

const { data: industry } = useAsyncData<IndustryDetail | null>(
  () => `solution-${slugStr.value}-${locale.value}`,
  async () => {
    const key = slugStr.value || '';
    const fallback = ((getIndustryMap(locale.value) as Record<string, unknown>)[key] as Partial<IndustryDetail> | undefined) || null;
    try {
      const cmsRes = await cmsApi.getIndustryBySlug(key);
      const cms = (cmsRes?.data || cmsRes) as Partial<IndustryDetail> | undefined;
      const merged = mergeIndustry(cms || null, fallback);
      if (merged) return merged;
    } catch (e) {
      if (import.meta.env.DEV) {
        const err = e as Error;
        console.warn(`[SolutionDetail] CMS load failed for ${key}, using fallback`, err.message);
      }
    }
    if (!fallback) {
      throw createError({ statusCode: 404, statusMessage: 'Solution Not Found', fatal: true });
    }
    return fallback as IndustryDetail;
  },
  { server: false, default: () => null, watch: [slug, locale] }
);

useHead(() => {
  if (!industry.value) return {};
  return {
    title: `${industry.value.label} | TalentPro`,
    meta: [
      { name: 'description', content: industry.value.heroDesc },
      { property: 'og:title', content: industry.value.label },
      { property: 'og:description', content: industry.value.heroDesc },
    ],
  };
});

onMounted(() => {
  watch(industry, (val) => {
    if (val) {
      injectJsonLd({
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: val.label,
        description: val.heroDesc,
        provider: { '@type': 'Organization', name: 'TalentPro' },
      });
    }
  }, { immediate: true });
});

onUnmounted(removeJsonLd);
</script>
