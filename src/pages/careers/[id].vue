<template>
  <div>
    <main :class="s.page">
      <div class="container">
        <Breadcrumb :items="[
          { label: t('careers.title'), to: '/careers' },
          { label: job?.title || t('careers.detail') },
        ]" />

        <div v-if="loading" :class="s.loading">{{ t('common.loading') }}</div>
        <div v-else-if="error && !job" :class="s.error">{{ error }}</div>

        <div v-else-if="job" :class="s.job" class="reveal">
          <div :class="s.header">
            <h1 :class="s.title">{{ job.title }}</h1>
            <div :class="s.meta">
              <span :class="s.metaTag">{{ job.department }}</span>
              <span :class="s.metaTag">{{ job.location }}</span>
              <span :class="s.metaTag">{{ job.type }}</span>
              <span v-if="job.salaryMin != null" :class="s.metaTag">{{ job.salaryMin }}k-{{ job.salaryMax ?? '-' }}k</span>
            </div>
          </div>

          <div :class="s.infoCard">
            <div :class="s.infoRow">
              <div :class="s.infoCell">
                <span :class="s.infoLabel">{{ t('careers.detailLabels.department') }}</span>
                <span :class="s.infoValue">{{ job.department }}</span>
              </div>
              <div :class="s.infoCell">
                <span :class="s.infoLabel">{{ t('careers.detailLabels.location') }}</span>
                <span :class="s.infoValue">{{ job.location }}</span>
              </div>
              <div :class="s.infoCell">
                <span :class="s.infoLabel">{{ t('careers.detailLabels.type') }}</span>
                <span :class="s.infoValue">{{ job.type }}</span>
              </div>
              <div v-if="job.experience" :class="s.infoCell">
                <span :class="s.infoLabel">{{ t('careers.detailLabels.experience') }}</span>
                <span :class="s.infoValue">{{ job.experience }}</span>
              </div>
              <div v-if="job.education" :class="s.infoCell">
                <span :class="s.infoLabel">{{ t('careers.detailLabels.education') }}</span>
                <span :class="s.infoValue">{{ job.education }}</span>
              </div>
              <div v-if="job.headcount" :class="s.infoCell">
                <span :class="s.infoLabel">{{ t('careers.detailLabels.headcount') }}</span>
                <span :class="s.infoValue">{{ job.headcount }}{{ t('units.people') }}</span>
              </div>
            </div>
          </div>

          <div :class="s.sections">
            <div :class="s.section">
              <h2 :class="s.sectionTitle">{{ t('careers.description') }}</h2>
              <div :class="s.sectionBody">
                <p v-for="(para, i) in descriptionParagraphs" :key="i" :class="s.paragraph">{{ para }}</p>
              </div>
            </div>
            <div :class="s.section">
              <h2 :class="s.sectionTitle">{{ t('careers.requirements') }}</h2>
              <ul :class="s.requireList">
                <li v-for="(r, i) in requirementsList" :key="i">{{ r }}</li>
              </ul>
            </div>
            <div :class="s.section">
              <h2 :class="s.sectionTitle">{{ t('careers.detailLabels.responsibilities') }}</h2>
              <ul :class="s.requireList">
                <li v-for="(r, i) in responsibilitiesList" :key="i">{{ r }}</li>
              </ul>
            </div>
            <div :class="s.section">
              <h2 :class="s.sectionTitle">{{ t('careers.detailLabels.applyProcess') }}</h2>
              <div :class="s.process">
                <div v-for="(step, i) in processSteps" :key="i" :class="s.processItem">
                  <div :class="s.processNum">{{ i + 1 }}</div>
                  <div>
                    <div :class="s.processTitle">{{ step.title }}</div>
                    <div :class="s.processDesc">{{ step.desc }}</div>
                  </div>
                </div>
              </div>
            </div>
            <div :class="s.section">
              <h2 :class="s.sectionTitle">{{ t('careers.benefitsTitle') }}</h2>
              <p :class="s.sectionBody">{{ t('careers.benefitsDesc') }}</p>
            </div>
          </div>

          <div :class="s.actions">
            <button :class="s.applyBtn" @click="handleApply">{{ t('careers.apply') }}</button>
          </div>
        </div>

        <div v-else :class="s.empty">{{ t('careers.notFound') }}</div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useJsonLd } from '@/shared/utils/jsonld';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb.vue';
import { careersApi } from '@/api/careers';
import { getJobMap } from '@/data/jobs';
import s from './[id].module.css';

definePageMeta({ title: 'careers.detail', description: 'careers.subtitle' });

const { t, locale } = useI18n();
const route = useRoute();
const id = computed(() => route.params.id);
const jobMap = computed(() => getJobMap(locale.value));

useHead(() => {
  if (!job.value) return {};
  const j = job.value;
  const url = `https://talentpro.cn/careers/${route.params.id}`;
  return {
    title: `${j.title} | TalentPro`,
    meta: [
      { name: 'description', content: j.description || t('careers.subtitle') },
      { property: 'og:title', content: j.title },
      { property: 'og:description', content: j.description || t('careers.subtitle') },
      { property: 'og:type', content: 'article' },
      { property: 'og:url', content: url },
      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:title', content: j.title },
      { name: 'twitter:description', content: j.description || t('careers.subtitle') },
    ],
    link: [{ rel: 'canonical', href: url }],
  };
});

const { data: job, pending: loading, error: fetchError } = useAsyncData(
  () => `career-${id.value}-${locale.value}`,
  async () => {
    const fallback = jobMap.value[id.value as string] || null;
    try {
      const res = await careersApi.getJob(id.value as string);
      const data = res.data || null;
      if (data) return data;
    } catch (e) {
      // API 不可用时降级到静态 fallback
      if (import.meta.env.DEV) {
        const err = e as Error;
        console.warn(`[CareerDetail] CMS load failed for ${id.value}, using fallback`, err.message);
      }
    }
    if (!fallback) {
      throw createError({ statusCode: 404, statusMessage: 'Job Not Found', fatal: true });
    }
    return fallback;
  },
  { default: () => null, watch: [id, locale] }
);

const error = computed(() => {
  if (!fetchError.value) return null;
  const err = fetchError.value as any;
  return err.response?.data?.message || err.message || t('common.loadError');
});

const descriptionParagraphs = computed(() => {
  const d = job.value?.description || '';
  return d.split(/\n{2,}/).filter(Boolean);
});

const requirementsList = computed(() => {
  const r = job.value?.requirements || '';
  if (!r) return [];
  return r.split('\n').filter((l: string) => l.trim()).map((l: string) => l.replace(/^[\s\-•]+/, '').trim());
});

const responsibilitiesList = computed(() => {
  const r = job.value?.responsibilities || '';
  if (!r) return [];
  return r.split('\n').filter((l: string) => l.trim()).map((l: string) => l.replace(/^[\s\-•]+/, '').trim());
});

const processSteps = [
  { title: t('careers.process.submit'), desc: t('careers.process.submitDesc') },
  { title: t('careers.process.screen'), desc: t('careers.process.screenDesc') },
  { title: t('careers.process.interview'), desc: t('careers.process.interviewDesc') },
  { title: t('careers.process.offer'), desc: t('careers.process.offerDesc') },
];

const handleApply = () => {
  import('@/utils/toast').then(({ showToast }) => showToast(t('careers.applyPrompt'), 'success'));
};

useJsonLd(computed(() => {
  const j = job.value;
  if (!j) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: j.title,
    description: j.description,
    hiringOrganization: { '@type': 'Organization', name: 'TalentPro' },
    jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: j.location, addressCountry: 'CN' } },
    employmentType: j.type,
    datePosted: j.createdAt,
  };
}));
</script>
