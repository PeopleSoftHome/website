<template>
  <div>
    <main :class="s.page">
      <div class="container">
        <Breadcrumb :items="[{ label: t('news.title'), to: '/news' }]" />

        <div :class="s.hero" class="reveal">
          <h1 :class="s.title">{{ t('news.title') }}</h1>
          <p :class="s.subtitle">{{ t('news.subtitle') }}</p>
        </div>

        <div :class="s.filter" class="reveal reveal-delay-1">
          <TabNav
            :tabs="categoryTabs"
            :active-index="activeCategoryIndex"
            variant="segment"
            @select="activeCategoryIndex = $event"
          />
        </div>

        <div v-if="loading" :class="s.loading">{{ t('common.loading') }}</div>
        <div v-else-if="error && displayNews.length === 0" :class="s.error">{{ error }}</div>

        <div v-if="featuredNews" :class="s.featured" class="reveal">
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
              <div :class="s.featuredAuthor">
                <span :class="s.authorAvatar">{{ featuredNews.author?.charAt(0) || '' }}</span>
                <span :class="s.authorName">{{ featuredNews.author }}</span>
              </div>
              <span :class="s.featuredCta">{{ t('news.readMore') }} →</span>
            </div>
          </NuxtLink>
        </div>

        <div :class="s.grid">
          <NuxtLink
            v-for="(item, idx) in normalNews"
            :key="item.id"
            :to="`/news/${item.slug}`"
            :class="s.card"
            :style="{ '--stagger': idx }"
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
              <div :class="s.cardAuthor">
                <span :class="s.authorAvatarSmall">{{ item.author?.charAt(0) || '' }}</span>
                <span :class="s.authorNameSmall">{{ item.author }}</span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ title: 'news.title', description: 'news.subtitle' });
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { NEWS_PAGE_SIZE } from '@/constants/pagination.js';
import { injectJsonLd, removeJsonLd } from '@/utils/jsonld.js';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb.vue';
import TabNav from '@/components/ui/TabNav/TabNav.vue';
import { newsApi } from '@/api/news.js';
import { NEWS_FALLBACK, NEWS_CATEGORIES } from '@/data/news.js';
import { useListPage } from '@/composables/useListPage.js';
import s from './index.module.css';

const { t } = useI18n();
const activeCategoryIndex = ref(0);

const categoryTabs = computed(() => NEWS_CATEGORIES.map((c) => ({ id: c, label: c })));
const activeCategory = computed(() => categoryTabs.value[activeCategoryIndex.value]?.id || NEWS_CATEGORIES[0]);

const filters = computed(() => ({ category: activeCategory.value }));

const {
  items: news,
  filteredItems,
  isLoading: loading,
  error: fetchError,
} = useListPage({
  key: 'news-list',
  fetchFn: () => newsApi.getNews({ page: 1, pageSize: NEWS_PAGE_SIZE }),
  filters,
  fallbackData: NEWS_FALLBACK,
  filterFn: (item, f) => f.category === '全部' || item.category === f.category,
});

const error = computed(() => {
  if (!fetchError.value) return null;
  const err = fetchError.value as any;
  return err.response?.data?.message || err.message || t('common.loadError');
});

const filteredNews = computed(() => filteredItems.value);

const featuredNews = computed(() => filteredNews.value.find((n) => n.featured) || filteredNews.value[0] || null);
const normalNews = computed(() => {
  const featured = featuredNews.value;
  if (!featured) return filteredNews.value;
  return filteredNews.value.filter((n) => n.id !== featured.id);
});

const displayNews = computed(() => news.value);

const formatDate = (d: string | number | Date | undefined) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString();
};

onMounted(() => {
  injectJsonLd({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: t('news.title'),
  });
});
onUnmounted(removeJsonLd);
</script>
