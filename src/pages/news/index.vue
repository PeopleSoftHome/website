<template>
  <div>

    <main :class="s.page">
      <div class="container">
        <Breadcrumb :items="[{ label: t('news.title'), to: '/news' }]" />

        <div :class="s.hero">
          <h1 :class="s.title">{{ t('news.title') }}</h1>
          <p :class="s.subtitle">{{ t('news.subtitle') }}</p>
        </div>

        <div v-if="loading" :class="s.loading">{{ t('common.loading') }}</div>
        <div v-else-if="error && news.length === 0" :class="s.error">{{ error }}</div>

        <div v-if="featuredNews" :class="s.featured">
          <NuxtLink :to="`/news/${featuredNews.slug}`" :class="s.featuredCard">
            <div v-if="featuredNews.coverImage" :class="s.featuredCover" :style="`background-image:url(${featuredNews.coverImage})`" />
            <div v-else :class="s.featuredCoverPlaceholder">
              <span>{{ featuredNews.title?.charAt(0) || '' }}</span>
            </div>
            <div :class="s.featuredContent">
              <div :class="s.featuredHeader">
                <span :class="s.featuredCategory">{{ featuredNews.category }}</span>
                <span :class="s.featuredDate">{{ formatDate(featuredNews.publishedAt) }}</span>
              </div>
              <h2 :class="s.featuredTitle">{{ featuredNews.title }}</h2>
              <p :class="s.featuredSummary">{{ featuredNews.summary }}</p>
              <span :class="s.featuredCta">{{ t('news.readMore') }} →</span>
            </div>
          </NuxtLink>
        </div>

        <div :class="s.grid">
          <NuxtLink
            v-for="item in normalNews"
            :key="item.id"
            :to="`/news/${item.slug}`"
            :class="s.card"
          >
            <div v-if="item.coverImage" :class="s.cardCover" :style="`background-image:url(${item.coverImage})`" />
            <div v-else :class="s.cardCoverPlaceholder">
              <span>{{ item.title?.charAt(0) || '' }}</span>
            </div>
            <div :class="s.cardContent">
              <div :class="s.cardHeader">
                <span :class="s.cardCategory">{{ item.category }}</span>
                <span :class="s.cardDate">{{ formatDate(item.publishedAt) }}</span>
              </div>
              <h3 :class="s.cardTitle">{{ item.title }}</h3>
              <p :class="s.cardSummary">{{ item.summary }}</p>
            </div>
          </NuxtLink>
        </div>
      </div>
    </main>

  </div>
</template>

<script setup>
definePageMeta({ title: 'news.title', description: 'news.subtitle' });
import { ref, computed, onMounted, onUnmounted, inject } from 'vue';
import { NEWS_PAGE_SIZE } from '@/constants/pagination.js';
import { injectJsonLd, removeJsonLd } from '@/utils/jsonld.js';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb.vue';
import { newsApi } from '@/api/news.js';
import s from './NewsListView.module.css';

const { t } = inject('i18n', { t: (k) => k });
const news = ref([]);
const loading = ref(false);
const error = ref(null);

const featuredNews = computed(() => news.value.find((n) => n.featured) || news.value[0] || null);
const normalNews = computed(() => {
  if (!featuredNews.value) return news.value;
  return news.value.filter((n) => n.id !== featuredNews.value.id);
});

const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString();
};

const fetchNews = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await newsApi.getNews({ page: 1, pageSize: NEWS_PAGE_SIZE });
    news.value = res.data || [];
  } catch (e) {
    error.value = e.response?.data?.message || t('common.loadError');
    news.value = [];
  }
  loading.value = false;
};

onMounted(() => {
  fetchNews();
  injectJsonLd({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: t('news.title'),
  });
});
onUnmounted(removeJsonLd);
</script>
