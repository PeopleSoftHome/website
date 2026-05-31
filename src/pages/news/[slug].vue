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

        <div v-else-if="item" :class="s.article">
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
import { computed, onUnmounted, inject } from 'vue';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb.vue';
import { newsApi } from '@/api/news.js';
import { removeJsonLd } from '@/utils/jsonld.js';
import s from './[slug].vue.module.css';

const { t } = useI18n();
const route = useRoute();

const { data: item, pending: loading, error: fetchError } = useAsyncData(
  `news-${route.params.slug}`,
  async () => {
    const res = await newsApi.getNewsItem(route.params.slug);
    const data = res.data || null;
    if (data) {
      document.title = `${data.title} | ${t('news.title')}`;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute('content', `${data.title} | ${t('news.title')}`);
    }
    return data;
  },
  { server: false, default: () => null }
);

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

onUnmounted(removeJsonLd);
</script>
