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

<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb.vue';
import { newsApi } from '@/api/news.js';
import { NEWS_FALLBACK } from '@/data/news.js';
import { injectJsonLd, removeJsonLd } from '@/utils/jsonld.js';
import s from './[slug].vue.module.css';

definePageMeta({ title: 'news.detail', description: 'news.subtitle' });

const { t } = useI18n();
const route = useRoute();
const showWxTip = ref(false);
const subscribeEmail = ref('');
const subscribeMsg = ref('');

const { data: apiItem, pending: loading, error: fetchError } = useAsyncData(
  `news-${route.params.slug}`,
  async () => {
    try {
      const res = await newsApi.getNewsItem(route.params.slug);
      return res.data || null;
    } catch (e) {
      return null;
    }
  },
  { server: false, default: () => null }
);

const item = computed(() => {
  if (apiItem.value) return apiItem.value;
  return NEWS_FALLBACK.find((n) => n.slug === route.params.slug) || null;
});

const error = computed(() => {
  if (!fetchError.value) return null;
  return fetchError.value?.response?.data?.message || fetchError.value?.message || t('common.loadError');
});

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

const paragraphs = computed(() => {
  if (!item.value?.content) return [];
  return item.value.content.split('\n').filter((p) => p.trim());
});

const allNews = computed(() => {
  const apiData = apiItem.value ? [apiItem.value] : [];
  return apiData.length > 0 ? apiData : NEWS_FALLBACK;
});

const relatedNews = computed(() => {
  if (!item.value) return [];
  return NEWS_FALLBACK.filter(
    (n) => n.category === item.value.category && n.id !== item.value.id
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

const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString();
};

const handleSubscribe = () => {
  subscribeMsg.value = '';
  if (!subscribeEmail.value.trim() || !/\S+@\S+\.\S+/.test(subscribeEmail.value)) {
    subscribeMsg.value = t('news.invalidEmail');
    return;
  }
  subscribeMsg.value = t('news.subscribeSuccess');
  subscribeEmail.value = '';
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
