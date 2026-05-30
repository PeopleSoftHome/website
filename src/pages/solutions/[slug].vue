<template>
  <div>

    <main :class="s.page">
      <div class="container">
        <Breadcrumb :items="[
          { label: t('solutions.title'), to: '/solutions' },
          { label: industry?.label || t('solutions.detail') },
        ]" />

        <div v-if="industry" :class="s.hero">
          <div :class="s.heroContent">
            <h1 :class="s.title">{{ industry.heroTitle }}</h1>
            <p :class="s.desc">{{ industry.heroDesc }}</p>
            <button :class="s.cta" @click="modalStore.openModal()">{{ t('solutions.demoCta') }}</button>
          </div>
          <div :class="s.heroStats">
            <div v-for="(st, i) in industry.stats" :key="i" :class="s.stat">
              <span :class="s.statValue">{{ st.value }}</span>
              <span :class="s.statLabel">{{ st.label }}</span>
            </div>
          </div>
        </div>

        <div v-if="industry?.painPoints?.length" :class="s.section">
          <h2 :class="s.sectionTitle">{{ t('solutions.painPoints') }}</h2>
          <div :class="s.painGrid">
            <div v-for="(p, i) in industry.painPoints" :key="i" :class="s.painCard">
              <div :class="s.painNum">0{{ i + 1 }}</div>
              <h3 :class="s.painTitle">{{ p.title }}</h3>
              <p :class="s.painDesc">{{ p.desc }}</p>
            </div>
          </div>
        </div>

        <div v-if="industry?.architecture?.length" :class="s.section">
          <h2 :class="s.sectionTitle">{{ t('solutions.architecture') }}</h2>
          <div :class="s.archGrid">
            <div v-for="(a, i) in industry.architecture" :key="i" :class="s.archCard">
              <div :class="s.archNum">0{{ i + 1 }}</div>
              <h3 :class="s.archTitle">{{ a.title }}</h3>
              <p :class="s.archDesc">{{ a.desc }}</p>
            </div>
          </div>
        </div>

        <div v-if="industry?.features?.length" :class="s.section">
          <h2 :class="s.sectionTitle">{{ t('solutions.keyFeatures') }}</h2>
          <div :class="s.featureGrid">
            <div v-for="(f, i) in industry.features" :key="i" :class="s.featureCard">
              <span :class="s.featureBadge">{{ f.badge }}</span>
              <h3 :class="s.featureTitle">{{ f.title }}</h3>
              <p :class="s.featureDesc">{{ f.desc }}</p>
            </div>
          </div>
        </div>

        <div v-if="industry?.roadmap?.length" :class="s.section">
          <h2 :class="s.sectionTitle">{{ t('solutions.roadmap') }}</h2>
          <div :class="s.roadmap">
            <div v-for="(r, i) in industry.roadmap" :key="i" :class="s.roadmapItem">
              <div :class="s.roadmapPhase">{{ r.phase }}</div>
              <h3 :class="s.roadmapTitle">{{ r.title }}</h3>
              <p :class="s.roadmapDesc">{{ r.desc }}</p>
            </div>
          </div>
        </div>

        <div v-if="industry?.caseStudy" :class="s.caseStudy">
          <div :class="s.caseHeader">
            <span :class="s.caseLabel">{{ t('solutions.caseStudy') }}</span>
            <h3 :class="s.caseTitle">{{ industry.caseStudy.client }}</h3>
            <p :class="s.caseMeta">{{ industry.caseStudy.industry }} · {{ industry.caseStudy.scale }}</p>
          </div>
          <div :class="s.caseBody">
            <div :class="s.caseBlock">
              <h4>{{ t('solutions.challenge') }}</h4>
              <p>{{ industry.caseStudy.challenge }}</p>
            </div>
            <div :class="s.caseBlock">
              <h4>{{ t('solutions.solution') }}</h4>
              <p>{{ industry.caseStudy.solution }}</p>
            </div>
            <div :class="s.caseBlock">
              <h4>{{ t('solutions.results') }}</h4>
            </div>
          </div>
          <div v-if="industry.caseStudy.results?.length" :class="s.caseMetrics">
            <div v-for="(m, i) in industry.caseStudy.results" :key="i" :class="s.caseMetric">
              <span :class="s.caseMetricValue">{{ m.value }}</span>
              <span :class="s.caseMetricLabel">{{ m.label }}</span>
            </div>
          </div>
          <div v-if="industry.caseStudy.quote" :class="s.caseQuote">
            <p>"{{ industry.caseStudy.quote }}"</p>
            <span>— {{ industry.caseStudy.author }}，{{ industry.caseStudy.title }}</span>
          </div>
        </div>

        <div v-if="industry?.roi?.length" :class="s.section">
          <h2 :class="s.sectionTitle">{{ t('solutions.roi') }}</h2>
          <div :class="s.roiGrid">
            <div v-for="(r, i) in industry.roi" :key="i" :class="s.roiCard">
              <span :class="s.roiMetric">{{ r.metric }}</span>
              <span :class="s.roiValue">{{ r.value }}</span>
              <span :class="s.roiDesc">{{ r.desc }}</span>
            </div>
          </div>
        </div>

        <div v-if="!industry" :class="s.empty">{{ t('solutions.notFound') }}</div>
      </div>
    </main>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, inject } from 'vue';
import { removeJsonLd } from '@/utils/jsonld.js';
import { useRoute } from 'vue-router';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb.vue';
import { INDUSTRY_MAP } from '@/data/industries.js';
import s from './SolutionDetailView.module.css';

const { t } = inject('i18n', { t: (k) => k });
const route = useRoute();
const modalStore = inject('modal', { openModal: () => {} });
const industry = ref(null);

onMounted(() => {
  const slug = route.params.slug;
  industry.value = INDUSTRY_MAP[slug] || null;
  if (industry.value) {
    document.title = `${industry.value.label} | ${t('solutions.title')}`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', `${industry.value.label} | ${t('solutions.title')}`);
  }
});
onUnmounted(removeJsonLd);
</script>
