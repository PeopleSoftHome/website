<template>
  <div>

    <main :class="s.page">
      <div class="container">
        <Breadcrumb :items="[
          { label: t('about.title'), to: '/about' },
          { label: t('team.title') },
        ]" />

        <div :class="s.hero" class="reveal">
          <h1 :class="s.title">{{ t('team.title') }}</h1>
          <p :class="s.subtitle">{{ t('team.subtitle') }}</p>
        </div>

        <div v-if="loading" :class="s.loading">{{ t('common.loading') }}</div>
        <div v-else-if="error && team.length === 0" :class="s.error">{{ error }}</div>

        <div v-else :class="s.grid" class="reveal">
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
definePageMeta({ title: 'team.title', description: 'team.subtitle' });
import { onMounted, onUnmounted, computed } from 'vue';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb.vue';
import { aboutApi } from '@/api/about.js';
import { injectJsonLd, removeJsonLd } from '@/utils/jsonld.js';
import s from './team.vue.module.css';

const { t } = useI18n();

const { data: team, pending: loading, error: asyncError } = useAsyncData(
  'about-team',
  async () => {
    const res = await aboutApi.getTeam();
    return res.data || [];
  },
  { server: false, default: () => [] }
);

const error = computed(() => {
  if (!asyncError.value) return null;
  return asyncError.value.response?.data?.message || asyncError.value.message || t('common.loadError');
});

onMounted(() => {
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
