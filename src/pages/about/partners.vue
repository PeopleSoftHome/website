<template>
  <div>

    <main :class="s.page">
      <div class="container">
        <Breadcrumb :items="[
          { label: t('about.title'), to: '/about' },
          { label: t('partners.title') },
        ]" />

        <div :class="s.hero">
          <h1 :class="s.title">{{ t('partners.title') }}</h1>
          <p :class="s.subtitle">{{ t('partners.subtitle') }}</p>
        </div>

        <div v-if="loading" :class="s.loading">{{ t('common.loading') }}</div>
        <div v-else-if="error && partners.length === 0" :class="s.error">{{ error }}</div>

        <div v-else :class="s.grid">
          <a
            v-for="p in partners"
            :key="p.id"
            :href="p.website"
            target="_blank"
            :class="s.partner"
          >
            <div v-if="p.logo" :class="s.logo" :style="`background-image:url(${p.logo})`" />
            <div v-else :class="s.logoPlaceholder">{{ p.name?.charAt(0) || '' }}</div>
            <h3 :class="s.name">{{ p.name }}</h3>
            <p :class="s.type">{{ p.type }}</p>
            <p v-if="p.description" :class="s.desc">{{ p.description }}</p>
          </a>
        </div>
      </div>
    </main>

  </div>
</template>

<script setup>
definePageMeta({ title: 'partners.title', description: 'partners.subtitle' });
import { ref, onMounted, onUnmounted, inject } from 'vue';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb.vue';
import { aboutApi } from '@/api/about.js';
import { injectJsonLd, removeJsonLd } from '@/utils/jsonld.js';
import s from './PartnersView.module.css';

const { t } = inject('i18n', { t: (k) => k });
const partners = ref([]);
const loading = ref(false);
const error = ref(null);

const fetchPartners = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await aboutApi.getPartners();
    partners.value = res.data || [];
  } catch (e) {
    error.value = e.response?.data?.message || t('common.loadError');
    partners.value = [];
  }
  loading.value = false;
};

onMounted(() => {
  fetchPartners();
  injectJsonLd({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: t('partners.jsonLdName'),
    description: t('partners.jsonLdDesc'),
    url: 'https://talentpro.cn/about/partners',
    publisher: {
      '@type': 'Organization',
      name: 'TalentPro',
      logo: { '@type': 'ImageObject', url: 'https://talentpro.cn/logo.png' },
    },
  });
});
onUnmounted(removeJsonLd);
</script>
