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
import { ref, onMounted, onUnmounted, inject } from 'vue';
import CommentSection from '@/components/ui/CommentSection/CommentSection.vue';
import { blogApi } from '@/api/blog.js';
import { renderMarkdown } from '@/utils/markdown.js';
import { formatDate } from '@/utils/date.js';
import { injectJsonLd, removeJsonLd } from '@/utils/jsonld.js';
import s from './BlogDetailView.module.css';

const { t } = inject('i18n', { t: (k) => k });
const route = useRoute();

const post = ref(null);
const loading = ref(false);
const error = ref(null);

const fetchPost = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await blogApi.getPost(route.params.slug);
    post.value = res.data || res;
    // 动态 SEO
    if (post.value) {
      document.title = `${post.value.title} | ${t('blog.pageTitle')}`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', post.value.excerpt?.slice(0, 160) || post.value.title);
      injectJsonLd({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.value.title,
        description: post.value.excerpt?.slice(0, 160) || post.value.title,
        author: { '@type': 'Organization', name: 'TalentPro' },
        datePublished: post.value.createdAt,
        dateModified: post.value.updatedAt || post.value.createdAt,
        publisher: {
          '@type': 'Organization',
          name: 'TalentPro',
          logo: { '@type': 'ImageObject', url: 'https://talentpro.cn/logo.png' },
        },
      });
    }
  } catch (e) {
    if (import.meta.env.DEV) console.error(e);
    error.value = e.response?.data?.message || t('common.loadError');
  }
  loading.value = false;
};


onMounted(fetchPost);
onUnmounted(removeJsonLd);
</script>
