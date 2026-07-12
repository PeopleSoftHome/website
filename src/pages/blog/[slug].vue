<template>
  <div>

    <main :class="s.blogDetailPage">
      <div class="container">
        <button :class="s.backBtn" @click="$router.push('/blog')">
          ← {{ t('blog.back') }}
        </button>

        <article v-if="post" :class="s.blogArticle" class="reveal">
          <div v-if="post.coverImage" :class="s.detailCover" :style="{ backgroundImage: `url(${post.coverImage})` }" />
          <div :class="s.detailMeta">
            <span :class="s.detailCategory">{{ post.category?.name }}</span>
            <span>{{ formatDate(post.createdAt) }}</span>
          </div>
          <h1 :class="s.detailTitle">{{ post.title }}</h1>
          <div :class="s.detailContent" v-html="renderMarkdown(post.content)" />
          <div :class="s.detailTags">
            <span v-for="tag in (post.tags || [])" :key="tag.id" :class="s.detailTag">{{ tag.name }}</span>
          </div>
        </article>

        <div v-else-if="loading" :class="s.detailLoading">
          <div :class="s.skeletonWrap">
            <div :class="s.skeletonLine" style="width:60%;height:24px" />
            <div :class="s.skeletonLine" style="width:40%;height:16px;margin-top:12px" />
            <div :class="s.skeletonLine" style="width:100%;height:120px;margin-top:20px" />
            <div :class="s.skeletonLine" style="width:100%;height:16px;margin-top:12px" />
            <div :class="s.skeletonLine" style="width:80%;height:16px;margin-top:8px" />
            <div :class="s.skeletonLine" style="width:90%;height:16px;margin-top:8px" />
          </div>
        </div>

        <div v-else-if="error" :class="s.errorBox">
          <p>{{ error }}</p>
          <button :class="s.retryBtn" @click="() => fetchPost()">{{ t('common.retry') }}</button>
        </div>

        <CommentSection
          v-if="post"
          entity-type="BlogPost"
          :entity-id="post.id"
        />
      </div>
    </main>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import CommentSection from '@/components/ui/CommentSection/CommentSection.vue';
import { blogApi } from '@/api/blog';
import { renderMarkdown } from '@/utils/markdown';
import { formatDate } from '@/utils/date';
import { useJsonLd } from '@/utils/jsonld';
import { getBlogPostMap } from '@/data/blog';
import s from './[slug].module.css';

definePageMeta({ title: 'blog.detail', description: 'blog.subtitle' });

const { t, locale } = useI18n();
const route = useRoute();
const slug = computed(() => route.params.slug);
const blogPostMap = computed(() => getBlogPostMap(locale.value));

const { data: post, pending: loading, error: fetchError, refresh: fetchPost } = useAsyncData(
  () => `blog-${locale.value}-${slug.value}`,
  async () => {
    try {
      const res = await blogApi.getPost(slug.value);
      const data = res.data || res || null;
      if (data) return data;
    } catch (_e) {
      // API 不可用时降级到静态 fallback
    }
    const fallback = blogPostMap.value[slug.value as string] || null;
    if (!fallback) {
      throw createError({ statusCode: 404, statusMessage: 'Blog Post Not Found', fatal: true });
    }
    return fallback;
  },
  { default: () => null, watch: [slug, locale] }
);

useHead(() => {
  if (!post.value) return {};
  const p = post.value;
  return {
    title: `${p.title} | TalentPro`,
    meta: [
      { name: 'description', content: p.excerpt?.slice(0, 160) || p.title },
      { property: 'og:title', content: p.title },
      { property: 'og:description', content: p.excerpt?.slice(0, 160) || p.title },
      { property: 'og:type', content: 'article' },
    ],
  };
});

const error = computed(() => {
  if (!fetchError.value) return null;
  const err = fetchError.value as any;
  return err.response?.data?.message || err.message || t('common.loadError');
});

useJsonLd(computed(() => {
  const val = post.value;
  if (!val) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: val.title,
    description: val.excerpt?.slice(0, 160) || val.title,
    author: { '@type': 'Organization', name: 'TalentPro' },
    datePublished: val.createdAt,
    dateModified: val.updatedAt || val.createdAt,
    publisher: {
      '@type': 'Organization',
      name: 'TalentPro',
      logo: { '@type': 'ImageObject', url: 'https://talentpro.cn/logo.png' },
    },
  };
}));
</script>
