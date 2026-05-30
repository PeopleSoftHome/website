<template>
  <div>

    <main :class="s.page">
      <div class="container">
        <Breadcrumb :items="[
          { label: t('about.title'), to: '/about' },
          { label: t('team.title') },
        ]" />

        <div :class="s.hero">
          <h1 :class="s.title">{{ t('team.title') }}</h1>
          <p :class="s.subtitle">{{ t('team.subtitle') }}</p>
        </div>

        <div v-if="loading" :class="s.loading">{{ t('common.loading') }}</div>
        <div v-else-if="error && team.length === 0" :class="s.error">{{ error }}</div>

        <div v-else :class="s.grid">
          <div v-for="member in team" :key="member.id" :class="s.member">
            <div :class="s.avatar" :style="member.avatar ? `background-image:url(${member.avatar})` : ''">
              <span v-if="!member.avatar">{{ member.name?.charAt(0) || '' }}</span>
            </div>
            <h3 :class="s.name">{{ member.name }}</h3>
            <p :class="s.role">{{ member.role }}</p>
            <p v-if="member.bio" :class="s.bio">{{ member.bio }}</p>
          </div>
        </div>
      </div>
    </main>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, inject } from 'vue';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb.vue';
import { aboutApi } from '@/api/about.js';
import { injectJsonLd, removeJsonLd } from '@/utils/jsonld.js';
import s from './TeamView.module.css';

const { t } = inject('i18n', { t: (k) => k });
const team = ref([]);
const loading = ref(false);
const error = ref(null);

const fetchTeam = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await aboutApi.getTeam();
    team.value = res.data || [];
  } catch (e) {
    error.value = e.response?.data?.message || t('common.loadError');
    team.value = [];
  }
  loading.value = false;
};

onMounted(() => {
  fetchTeam();
  injectJsonLd({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: t('team.jsonLdName'),
    description: t('team.jsonLdDesc'),
    url: 'https://talentpro.cn/about/team',
    publisher: {
      '@type': 'Organization',
      name: 'TalentPro',
      logo: { '@type': 'ImageObject', url: 'https://talentpro.cn/logo.png' },
    },
  });
});
onUnmounted(removeJsonLd);
</script>
