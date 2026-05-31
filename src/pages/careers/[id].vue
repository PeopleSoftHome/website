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

        <div v-else-if="job" :class="s.job">
          <div :class="s.header">
            <h1 :class="s.title">{{ job.title }}</h1>
            <div :class="s.meta">
              <span :class="s.metaTag">{{ job.department }}</span>
              <span :class="s.metaTag">{{ job.location }}</span>
              <span :class="s.metaTag">{{ job.type }}</span>
              <span v-if="job.salaryMin != null" :class="s.metaTag">{{ job.salaryMin }}k-{{ job.salaryMax ?? '-' }}k</span>
            </div>
          </div>

          <div :class="s.sections">
            <div :class="s.section">
              <h2 :class="s.sectionTitle">{{ t('careers.description') }}</h2>
              <p :class="s.sectionBody">{{ job.description || t('careers.noDescription') }}</p>
            </div>
            <div :class="s.section">
              <h2 :class="s.sectionTitle">{{ t('careers.requirements') }}</h2>
              <p :class="s.sectionBody">{{ job.requirements || t('careers.noRequirements') }}</p>
            </div>
            <div :class="s.section">
              <h2 :class="s.sectionTitle">{{ t('careers.benefits') }}</h2>
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

<script setup>
import { computed, onUnmounted, inject } from 'vue';
import { removeJsonLd } from '@/utils/jsonld.js';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb.vue';
import { careersApi } from '@/api/careers.js';
import s from './[id].vue.module.css';

const { t } = useI18n();
const route = useRoute();

const { data: job, pending: loading, error: fetchError } = useAsyncData(
  `career-${route.params.id}`,
  async () => {
    const res = await careersApi.getJob(route.params.id);
    const data = res.data || null;
    if (data) {
      document.title = `${data.title} | ${t('careers.title')}`;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute('content', `${data.title} | ${t('careers.title')}`);
    }
    return data;
  },
  { server: false, default: () => null }
);

const error = computed(() => {
  if (!fetchError.value) return null;
  return fetchError.value.response?.data?.message || fetchError.value.message || t('common.loadError');
});

const handleApply = () => {
  import('@/utils/toast.js').then(({ showToast }) => showToast(t('careers.applyPrompt') || '申请已提交，我们会尽快与您联系！', 'success'));
};

onUnmounted(removeJsonLd);
</script>
