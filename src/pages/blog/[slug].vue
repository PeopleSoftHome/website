<template>
  <div>

    <main :class="s.blogDetailPage">
      <div class="container">
        <button :class="s.backBtn" @click="$router.push('/blog')">
          ← {{ t('blog.back') }}
        </button>

        <article v-if="post" :class="s.blogArticle">
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
          <button :class="s.retryBtn" @click="fetchPost">{{ t('common.retry') }}</button>
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

<script setup>
import { computed, onMounted, onUnmounted, inject, watch } from 'vue';
import CommentSection from '@/components/ui/CommentSection/CommentSection.vue';
import { blogApi } from '@/api/blog.js';
import { renderMarkdown } from '@/utils/markdown.js';
import { formatDate } from '@/utils/date.js';
import { injectJsonLd, removeJsonLd } from '@/utils/jsonld.js';
import s from './BlogDetailView.module.css';

const { t } = inject('i18n', { t: (k) => k });
const route = useRoute();

const { data: post, pending: loading, error: fetchError, refresh: fetchPost } = useAsyncData(
  `blog-${route.params.slug}`,
  async () => {
    const res = await blogApi.getPost(route.params.slug);
    const data = res.data || res;
    if (data) {
      document.title = `${data.title} | ${t('blog.pageTitle')}`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', data.excerpt?.slice(0, 160) || data.title);
    }
    return data;
  },
  { server: false, default: () => null }
);

const error = computed(() => {
  if (!fetchError.value) return null;
  return fetchError.value.response?.data?.message || fetchError.value.message || t('common.loadError');
});

onMounted(() => {
  watch(post, (val) => {
    if (val) {
      injectJsonLd({
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
      });
    }
  }, { immediate: true });
});
onUnmounted(removeJsonLd);
</script>
