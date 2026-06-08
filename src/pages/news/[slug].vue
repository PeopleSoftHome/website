<template>
  <div>

    <main :class="s.page">
      <div class="container">
        <Breadcrumb :items="[
          { label: t('news.title'), to: '/news' },
          { label: item?.title || t('news.detail') },
        ]" />

        <div v-if="loading" :class="s.loading">{{ t('common.loading') }}</div>
        <div v-else-if="error && !item" :class="s.error">{{ error }}</div>

        <div v-else-if="item" :class="s.article" class="reveal">
          <div :class="s.header">
            <span :class="s.category">{{ item.category }}</span>
            <h1 :class="s.title">{{ item.title }}</h1>
            <div :class="s.meta">
              <span>{{ item.author }}</span>
              <span>{{ formatDate(item.publishedAt) }}</span>
            </div>
          </div>
          <div v-if="item.coverImage" :class="s.cover" :style="`background-image:url(${item.coverImage})`" />
          <div :class="s.body">
            <p v-for="(para, i) in paragraphs" :key="i" :class="s.paragraph">{{ para }}</p>
          </div>
        </div>

        <div v-else :class="s.empty">{{ t('news.notFound') }}</div>
      </div>
    </main>

  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, watch } from 'vue';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb.vue';
import { newsApi } from '@/api/news.js';
import { injectJsonLd, removeJsonLd } from '@/utils/jsonld.js';
import s from './[slug].vue.module.css';

definePageMeta({ title: 'news.detail', description: 'news.subtitle' });

const { t } = useI18n();
const route = useRoute();

const { data: item, pending: loading, error: fetchError } = useAsyncData(
  `news-${route.params.slug}`,
  async () => {
    const res = await newsApi.getNewsItem(route.params.slug);
    return res.data || null;
  },
  { server: false, default: () => null }
);

useHead(() => {
  if (!item.value) return {};
  return {
    title: `${item.value.title} | TalentPro`,
    meta: [
      { name: 'description', content: item.value.summary || item.value.title },
      { property: 'og:title', content: item.value.title },
      { property: 'og:description', content: item.value.summary || item.value.title },
    ],
  };
});

const error = computed(() => {
  if (!fetchError.value) return null;
  return fetchError.value.response?.data?.message || fetchError.value.message || t('common.loadError');
});

const paragraphs = computed(() => {
  if (!item.value?.content) return [];
  return item.value.content.split('\n').filter((p) => p.trim());
});

const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString();
};

onMounted(() => {
  watch(item, (val) => {
    if (val) {
      injectJsonLd({
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: val.title,
        description: val.summary || val.title,
        datePublished: val.publishedAt,
        author: { '@type': 'Organization', name: val.author || 'TalentPro' },
        publisher: { '@type': 'Organization', name: 'TalentPro' },
      });
    }
  }, { immediate: true });
});

onUnmounted(removeJsonLd);
</script>
