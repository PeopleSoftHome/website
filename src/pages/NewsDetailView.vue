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
import { ref, computed, onMounted, onUnmounted, inject } from 'vue';
import { useRoute } from 'vue-router';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb.vue';
import { newsApi } from '@/api/news.js';
import { removeJsonLd } from '@/utils/jsonld.js';
import s from './NewsDetailView.module.css';

const { t } = inject('i18n', { t: (k) => k });
const route = useRoute();
const item = ref(null);
const loading = ref(false);
const error = ref(null);

const paragraphs = computed(() => {
  if (!item.value?.content) return [];
  return item.value.content.split('\n').filter((p) => p.trim());
});

const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString();
};

const fetchNews = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await newsApi.getNewsItem(route.params.slug);
    item.value = res.data || null;
  } catch (e) {
    error.value = e.response?.data?.message || t('common.loadError');
  }
  loading.value = false;
  if (item.value) {
    document.title = `${item.value.title} | ${t('news.title')}`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', `${item.value.title} | ${t('news.title')}`);
  }
};

onMounted(fetchNews);
onUnmounted(removeJsonLd);
</script>
