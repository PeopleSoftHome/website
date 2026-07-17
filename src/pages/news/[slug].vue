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

            <!-- 作者卡片 -->
            <div :class="s.authorCard">
              <span :class="s.authorAvatar">{{ item.author?.charAt(0) || '' }}</span>
              <div :class="s.authorInfo">
                <span :class="s.authorName">{{ item.author }}</span>
                <span :class="s.authorTitle">{{ item.authorTitle }}</span>
              </div>
              <span :class="s.metaDate">{{ formatDate(item.publishedAt) }}</span>
            </div>

            <!-- 分享按钮 -->
            <div :class="s.share">
              <span :class="s.shareLabel">{{ t('news.share') }}</span>
              <a :href="weiboShareUrl" target="_blank" :class="s.shareBtn">{{ t('news.weibo') }}</a>
              <a :href="linkedinShareUrl" target="_blank" :class="s.shareBtn">{{ t('news.linkedin') }}</a>
              <span :class="s.shareTip" @click="showWxTip = !showWxTip">{{ t('news.wechat') }}</span>
              <span v-if="showWxTip" :class="s.wxTip">{{ t('news.wechatTip') }}</span>
            </div>
          </div>

          <div v-if="item.coverImage" :class="s.cover" :style="`background-image:url(${item.coverImage})`" />

          <div :class="s.body">
            <p v-for="(para, i) in paragraphs" :key="i" :class="s.paragraph">{{ para }}</p>
          </div>

          <!-- 底部分享 -->
          <div :class="s.bottomShare">
            <span :class="s.shareLabel">{{ t('news.share') }}</span>
            <a :href="weiboShareUrl" target="_blank" :class="s.shareBtn">{{ t('news.weibo') }}</a>
            <a :href="linkedinShareUrl" target="_blank" :class="s.shareBtn">{{ t('news.linkedin') }}</a>
          </div>

          <!-- 相关新闻 -->
          <div v-if="relatedNews.length" :class="s.related" class="reveal">
            <h3 :class="s.relatedTitle">{{ t('news.related') }}</h3>
            <div :class="s.relatedGrid">
              <NuxtLink
                v-for="n in relatedNews"
                :key="n.id"
                :to="`/news/${n.slug}`"
                :class="s.relatedCard"
              >
                <div v-if="n.coverImage" :class="s.relatedCover" :style="`background-image:url(${n.coverImage})`" />
                <div v-else :class="s.relatedCoverPlaceholder">
                  <span>{{ n.title?.charAt(0) || '' }}</span>
                </div>
                <div :class="s.relatedContent">
                  <span :class="s.relatedCategory">{{ n.category }}</span>
                  <h4 :class="s.relatedName">{{ n.title }}</h4>
                </div>
              </NuxtLink>
            </div>
          </div>

          <!-- 订阅 CTA -->
          <div :class="s.subscribe" class="reveal">
            <h3 :class="s.subscribeTitle">{{ t('news.subscribeTitle') }}</h3>
            <p :class="s.subscribeDesc">{{ t('news.subscribeDesc') }}</p>
            <div :class="s.subscribeForm">
              <input
                v-model="subscribeEmail"
                :class="s.subscribeInput"
                type="email"
                :placeholder="t('news.emailPlaceholder')"
              />
              <button :class="s.subscribeBtn" @click="handleSubscribe">{{ t('news.subscribe') }}</button>
            </div>
            <span v-if="subscribeMsg" :class="s.subscribeMsg">{{ subscribeMsg }}</span>
          </div>
        </div>

        <div v-else :class="s.empty">{{ t('news.notFound') }}</div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb.vue';
import { newsApi } from '@/api/news';
import { getNewsArticles } from '@/data/news';
import { useDetailPage } from '@/composables/useDetailPage';
import { useJsonLd } from '@/shared/utils/jsonld';
import s from './[slug].module.css';

definePageMeta({ title: 'news.detail', description: 'news.subtitle' });

const { t, locale } = useI18n();
const route = useRoute();
const slug = computed(() => {
  const s = route.params.slug;
  return Array.isArray(s) ? s[0] : s;
});
const showWxTip = ref(false);
const subscribeEmail = ref('');
const subscribeMsg = ref('');

interface NewsItem {
  id: string;
  slug: string;
  title: string;
  summary?: string;
  content: string;
  category: string;
  coverImage?: string;
  author?: string;
  authorTitle?: string;
  publishedAt: string;
  featured?: boolean;
  tags?: string[];
  [key: string]: unknown;
}

const newsFallback = computed(() => getNewsArticles(locale.value));
const newsFallbackMap = computed(() => Object.fromEntries(newsFallback.value.map((n) => [n.slug, n])));

const { data: item, isLoading: loading, error } = useDetailPage<NewsItem>({
  keyFn: () => `news-${locale.value}-${slug.value}`,
  fetchFn: async (value) => {
    const res = await newsApi.getNewsItem(value);
    return (res.data as NewsItem) || null;
  },
  param: slug,
  fallbackMap: newsFallbackMap,
  notFoundMessage: 'News Not Found',
  server: true,
});

useHead(() => {
  if (!item.value) return {};
  const url = `https://talentpro.cn/news/${route.params.slug}`;
  return {
    title: `${item.value.title} | TalentPro`,
    meta: [
      { name: 'description', content: item.value.summary || item.value.title },
      { property: 'og:title', content: item.value.title },
      { property: 'og:description', content: item.value.summary || item.value.title },
      { property: 'og:type', content: 'article' },
      { property: 'og:url', content: url },
      { property: 'og:image', content: item.value.coverImage || 'https://talentpro.cn/og-image.png' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: item.value.title },
      { name: 'twitter:description', content: item.value.summary || item.value.title },
      { name: 'twitter:image', content: item.value.coverImage || 'https://talentpro.cn/og-image.png' },
    ],
    link: [{ rel: 'canonical', href: url }],
  };
});

const paragraphs = computed(() => {
  const content = (item.value as NewsItem | null)?.content;
  if (!content) return [];
  return content.split('\n').filter((p: string) => p.trim());
});

const relatedNews = computed(() => {
  const it = item.value;
  if (!it) return [];
  return newsFallback.value.filter(
    (n) => n.category === it.category && n.id !== it.id
  ).slice(0, 3);
});

const pageUrl = computed(() => {
  if (process.client) return window.location.href;
  return `https://talentpro.cn/news/${route.params.slug}`;
});

const weiboShareUrl = computed(() => {
  return `https://service.weibo.com/share/share.php?url=${encodeURIComponent(pageUrl.value)}&title=${encodeURIComponent(item.value?.title || '')}`;
});

const linkedinShareUrl = computed(() => {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl.value)}`;
});

const handleSubscribe = () => {
  subscribeMsg.value = '';
  if (!subscribeEmail.value.trim() || !/\S+@\S+\.\S+/.test(subscribeEmail.value)) {
    subscribeMsg.value = t('news.invalidEmail');
    return;
  }
  subscribeMsg.value = t('news.subscribeSuccess');
  subscribeEmail.value = '';
};

useJsonLd(computed(() => {
  const val = item.value;
  if (!val) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: val.title,
    description: val.summary || val.title,
    datePublished: val.publishedAt,
    author: { '@type': 'Organization', name: val.author || 'TalentPro' },
    publisher: { '@type': 'Organization', name: 'TalentPro' },
  };
}));
</script>
