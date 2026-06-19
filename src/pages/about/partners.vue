<template>
  <div>

    <main :class="s.page">
      <div class="container">
        <Breadcrumb :items="[
          { label: t('about.title'), to: '/about' },
          { label: t('partners.title') },
        ]" />

        <div :class="s.hero" class="reveal">
          <h1 :class="s.title">{{ t('partners.title') }}</h1>
          <p :class="s.subtitle">{{ t('partners.subtitle') }}</p>
        </div>

        <div v-if="loading" :class="s.loading">{{ t('common.loading') }}</div>
        <div v-else-if="error && partners.length === 0" :class="s.error">{{ error }}</div>

        <div v-else :class="s.grid" class="reveal">
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

<script setup lang="ts">
definePageMeta({ title: 'partners.title', description: 'partners.subtitle' });
import { onMounted, onUnmounted, computed } from 'vue';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb.vue';
import { aboutApi } from '@/api/about.js';
import { injectJsonLd, removeJsonLd } from '@/utils/jsonld.js';
import s from './partners.vue.module.css';

const { t } = useI18n();

const { data: partners, pending: loading, error: asyncError } = useAsyncData(
  'about-partners',
  async () => {
    const res = await aboutApi.getPartners({});
    return res.data || [];
  },
  { server: false, default: () => [] as any[] }
);

const error = computed(() => {
  if (!asyncError.value) return null;
  const err = asyncError.value as any;
  return err.response?.data?.message || err.message || t('common.loadError');
});

onMounted(() => {
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
