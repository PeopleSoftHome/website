<template>
  <div>

    <main :class="s.page">
      <div class="container">
        <Breadcrumb :items="[{ label: t('careers.title'), to: '/careers' }]" />

        <div :class="s.hero">
          <h1 :class="s.title">{{ t('careers.title') }}</h1>
          <p :class="s.subtitle">{{ t('careers.subtitle') }}</p>
        </div>

        <div :class="s.channels">
          <NuxtLink to="/careers/campus" :class="s.channelCard">
            <div :class="s.channelIcon">🎓</div>
            <h3 :class="s.channelTitle">{{ t('careers.campus') }}</h3>
            <p :class="s.channelDesc">{{ t('careers.campusSubtitle') }}</p>
            <span :class="s.channelCta">{{ t('careers.viewJobs') }} →</span>
          </NuxtLink>
          <NuxtLink to="/careers/social" :class="s.channelCard">
            <div :class="s.channelIcon">💼</div>
            <h3 :class="s.channelTitle">{{ t('careers.social') }}</h3>
            <p :class="s.channelDesc">{{ t('careers.socialSubtitle') }}</p>
            <span :class="s.channelCta">{{ t('careers.viewJobs') }} →</span>
          </NuxtLink>
        </div>

        <div :class="s.filter">
          <button :class="[s.filterBtn, !activeDept ? s.filterActive : '']" @click="activeDept = ''">
            {{ t('careers.all') }}
          </button>
          <button
            v-for="d in departments"
            :key="d"
            :class="[s.filterBtn, activeDept === d ? s.filterActive : '']"
            @click="activeDept = d"
          >
            {{ d }}
          </button>
        </div>

        <div v-if="loading" :class="s.loading">{{ t('common.loading') }}</div>
        <div v-else-if="error && jobs.length === 0" :class="s.error">{{ error }}</div>

        <div v-else :class="s.list">
          <NuxtLink
            v-for="job in jobs"
            :key="job.id"
            :to="`/careers/${job.id}`"
            :class="s.job"
          >
            <div :class="s.jobHeader">
              <h3 :class="s.jobTitle">{{ job.title }}</h3>
              <span :class="s.jobType">{{ job.type }}</span>
            </div>
            <div :class="s.jobMeta">
              <span>{{ job.department }}</span>
              <span>{{ job.location }}</span>
              <span v-if="job.salaryMin != null">{{ job.salaryMin }}k-{{ job.salaryMax ?? '-' }}k</span>
            </div>
            <p v-if="job.summary" :class="s.jobSummary">{{ job.summary }}</p>
          </NuxtLink>
        </div>

        <div :class="s.benefits">
          <h2 :class="s.benefitsTitle">{{ t('careers.benefits') }}</h2>
          <p :class="s.benefitsDesc">{{ t('careers.benefitsDesc') }}</p>
          <div :class="s.benefitGrid">
            <div v-for="(b, i) in benefits" :key="i" :class="s.benefitCard">
              <div :class="s.benefitIcon">{{ b.icon }}</div>
              <h4 :class="s.benefitName">{{ t(b.nameKey) }}</h4>
              <p :class="s.benefitDesc">{{ t(b.descKey) }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>

  </div>
</template>

<script setup>
definePageMeta({ title: 'careers.title', description: 'careers.subtitle' });
import { ref, computed, onMounted, onUnmounted, inject } from 'vue';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb.vue';
import { careersApi } from '@/api/careers.js';
import { injectJsonLd, removeJsonLd } from '@/utils/jsonld.js';
import s from './index.vue.module.css';

const { t } = useI18n();

const activeDept = ref('');

const { data: jobsRes, pending: loading, error: fetchError } = useAsyncData(
  'careers-jobs',
  () => careersApi.getJobs({ department: activeDept.value || undefined }),
  { server: false, watch: [activeDept], default: () => ({ data: [] }) }
);

const jobs = computed(() => {
  if (fetchError.value) return [];
  return jobsRes.value?.data || [];
});
const departments = computed(() => {
  const depts = new Set((jobsRes.value?.data || []).map((j) => j.department).filter(Boolean));
  return Array.from(depts);
});
const error = computed(() => {
  if (!fetchError.value) return null;
  return fetchError.value?.response?.data?.message || fetchError.value?.message || t('common.loadError');
});

const benefits = [
  { icon: '💰', nameKey: 'careers.benefits.salary', descKey: 'careers.benefits.salaryDesc' },
  { icon: '📈', nameKey: 'careers.benefits.growth', descKey: 'careers.benefits.growthDesc' },
  { icon: '🏥', nameKey: 'careers.benefits.health', descKey: 'careers.benefits.healthDesc' },
  { icon: '🏠', nameKey: 'careers.benefits.flexible', descKey: 'careers.benefits.flexibleDesc' },
  { icon: '🍱', nameKey: 'careers.benefits.lifestyle', descKey: 'careers.benefits.lifestyleDesc' },
  { icon: '🌍', nameKey: 'careers.benefits.team', descKey: 'careers.benefits.teamDesc' },
];

onMounted(() => {
  injectJsonLd({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: t('careers.jsonLdName'),
    description: t('careers.jsonLdDesc'),
    url: 'https://talentpro.cn/careers',
    publisher: {
      '@type': 'Organization',
      name: 'TalentPro',
      logo: { '@type': 'ImageObject', url: 'https://talentpro.cn/logo.png' },
    },
  });
});
onUnmounted(removeJsonLd);
</script>
