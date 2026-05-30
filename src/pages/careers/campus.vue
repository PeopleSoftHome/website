<template>
  <div>

    <main :class="s.page">
      <div class="container">
        <Breadcrumb :items="[
          { label: t('careers.title'), to: '/careers' },
          { label: t('careers.campus') },
        ]" />

        <div :class="s.hero">
          <h1 :class="s.title">{{ t('careers.campus') }}</h1>
          <p :class="s.subtitle">{{ t('careers.campusSubtitle') }}</p>
        </div>

        <div :class="s.programs">
          <div :class="s.programCard">
            <div :class="s.programIcon">🎯</div>
            <h3 :class="s.programTitle">{{ t('careers.gradProgram') }}</h3>
            <p :class="s.programDesc">{{ t('careers.gradProgramDesc') }}</p>
          </div>
          <div :class="s.programCard">
            <div :class="s.programIcon">💻</div>
            <h3 :class="s.programTitle">{{ t('careers.internship') }}</h3>
            <p :class="s.programDesc">{{ t('careers.internshipDesc') }}</p>
          </div>
          <div :class="s.programCard">
            <div :class="s.programIcon">🔬</div>
            <h3 :class="s.programTitle">{{ t('careers.research') }}</h3>
            <p :class="s.programDesc">{{ t('careers.researchDesc') }}</p>
          </div>
        </div>

        <div :class="s.jobs">
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
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </main>

  </div>
</template>

<script setup>
definePageMeta({ title: 'careers.campusSubtitle', description: 'careers.subtitle' });
import { ref, onMounted, onUnmounted, inject } from 'vue';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb.vue';
import { careersApi } from '@/api/careers.js';
import { injectJsonLd, removeJsonLd } from '@/utils/jsonld.js';
import s from './CampusCareersView.module.css';

const { t } = inject('i18n', { t: (k) => k });
const jobs = ref([]);
const loading = ref(false);
const error = ref(null);

const fetchJobs = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await careersApi.getJobs({ type: t('careersType.campus') });
    jobs.value = res.data || [];
  } catch (e) {
    error.value = e.response?.data?.message || t('common.loadError');
    jobs.value = [];
  }
  loading.value = false;
};

onMounted(() => {
  fetchJobs();
  injectJsonLd({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: t('careers.jsonLdName'),
    description: t('careers.campusSubtitle'),
    url: 'https://talentpro.cn/careers/campus',
    publisher: {
      '@type': 'Organization',
      name: 'TalentPro',
      logo: { '@type': 'ImageObject', url: 'https://talentpro.cn/logo.png' },
    },
  });
});
onUnmounted(removeJsonLd);
</script>
