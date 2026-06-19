<template>
  <div>

    <main :class="s.page">
      <div class="container">
        <Breadcrumb :items="[
          { label: t('careers.title'), to: '/careers' },
          { label: t('careers.social') },
        ]" />

        <div :class="s.hero" class="reveal">
          <h1 :class="s.title">{{ t('careers.social') }}</h1>
          <p :class="s.subtitle">{{ t('careers.socialSubtitle') }}</p>
        </div>

        <div :class="s.highlights" class="reveal">
          <div :class="s.highlightCard">
            <div :class="s.highlightIcon">🌱</div>
            <h3 :class="s.highlightTitle">{{ t('careers.culture') }}</h3>
            <p :class="s.highlightDesc">{{ t('careers.cultureDesc') }}</p>
          </div>
          <div :class="s.highlightCard">
            <div :class="s.highlightIcon">📈</div>
            <h3 :class="s.highlightTitle">{{ t('careers.growth') }}</h3>
            <p :class="s.highlightDesc">{{ t('careers.growthDesc') }}</p>
          </div>
        </div>

        <div :class="s.jobs" class="reveal">
          <h2 :class="s.jobsTitle">{{ t('careers.viewJobs') }}</h2>
          <div v-if="loading" :class="s.loading">{{ t('common.loading') }}</div>
          <div v-else-if="error" :class="s.error">{{ error }}</div>
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
            </NuxtLink>
          </div>
        </div>
      </div>
    </main>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ title: 'careers.socialSubtitle', description: 'careers.subtitle' });
import { computed, onMounted, onUnmounted } from 'vue';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb.vue';
import { careersApi } from '@/api/careers.js';
import { injectJsonLd, removeJsonLd } from '@/utils/jsonld.js';
import s from './social.vue.module.css';

const { t } = useI18n();

const { data: jobsRes, pending: loading, error: fetchError } = useAsyncData(
  'careers-social-jobs',
  () => careersApi.getJobs({ type: t('careersType.social') }),
  { server: false, default: () => ({ data: [] }) }
);

const jobs = computed(() => {
  if (fetchError.value) return [];
  return jobsRes.value?.data || [];
});
const error = computed(() => {
  if (!fetchError.value) return null;
  return fetchError.value?.response?.data?.message || fetchError.value?.message || t('common.loadError');
});

onMounted(() => {
  injectJsonLd({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: t('careers.jsonLdName'),
    description: t('careers.socialSubtitle'),
    url: 'https://talentpro.cn/careers/social',
    publisher: {
      '@type': 'Organization',
      name: 'TalentPro',
      logo: { '@type': 'ImageObject', url: 'https://talentpro.cn/logo.png' },
    },
  });
});
onUnmounted(removeJsonLd);
</script>
