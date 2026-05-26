<template>
  <div>
    <NavBar />
    <main class="blog-detail-page">
      <div class="container">
        <button class="back-btn" @click="$router.push('/blog')">
          ← {{ t('blog.back') }}
        </button>

        <article v-if="post" class="blog-article">
          <div v-if="post.coverImage" class="detail-cover" :style="{ backgroundImage: `url(${post.coverImage})` }" />
          <div class="detail-meta">
            <span class="detail-category">{{ post.category?.name }}</span>
            <span>{{ formatDate(post.createdAt) }}</span>
          </div>
          <h1 class="detail-title">{{ post.title }}</h1>
          <div class="detail-content" v-html="renderMarkdown(post.content)" />
          <div class="detail-tags">
            <span v-for="tag in (post.tags || [])" :key="tag.id" class="detail-tag">{{ tag.name }}</span>
          </div>
        </article>

        <div v-else-if="loading" class="detail-loading">
          <div class="skeleton-wrap">
            <div class="skeleton-line" style="width:60%;height:24px" />
            <div class="skeleton-line" style="width:40%;height:16px;margin-top:12px" />
            <div class="skeleton-line" style="width:100%;height:120px;margin-top:20px" />
            <div class="skeleton-line" style="width:100%;height:16px;margin-top:12px" />
            <div class="skeleton-line" style="width:80%;height:16px;margin-top:8px" />
            <div class="skeleton-line" style="width:90%;height:16px;margin-top:8px" />
          </div>
        </div>

        <CommentSection
          v-if="post"
          entity-type="BlogPost"
          :entity-id="post.id"
        />
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue';
import { useRoute } from 'vue-router';
import Icon from '@/components/ui/Icon/Icon.vue';
import NavBar from '@/components/layout/NavBar/NavBar.vue';
import Footer from '@/components/layout/Footer/Footer.vue';
import CommentSection from '@/components/ui/CommentSection/CommentSection.vue';
import { blogApi } from '@/api/blog.js';

const { t } = inject('i18n', { t: (k) => k });
const route = useRoute();

const post = ref(null);
const loading = ref(false);

const fetchPost = async () => {
  loading.value = true;
  try {
    const res = await blogApi.getPost(route.params.slug);
    post.value = res.data || res;
  } catch (e) {
    console.error(e);
  }
  loading.value = false;
};

const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('zh-CN');
};

// 简单 Markdown 渲染：标题、粗体、链接、段落
const renderMarkdown = (md) => {
  if (!md) return '';
  return md
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\n/g, '<br>');
};

onMounted(fetchPost);
</script>

<style scoped>
.blog-detail-page { padding: 40px 0 80px; background: var(--page-bg); min-height: 60vh; }
.back-btn { display: inline-flex; align-items: center; gap: 6px; margin-bottom: 24px; padding: 8px 16px; border-radius: var(--radius-pill); border: 1px solid var(--card-border); background: var(--card-bg); color: var(--gray-700); cursor: pointer; font-size: 14px; transition: all 0.2s; }
.back-btn:hover { border-color: var(--primary); color: var(--primary); }

.blog-article { max-width: 760px; margin: 0 auto; background: var(--card-bg); border: 1px solid var(--card-border); border-radius: var(--radius-lg); padding: 40px; }
.detail-cover { height: 300px; border-radius: var(--radius-md); background-size: cover; background-position: center; margin-bottom: 24px; }
.detail-meta { display: flex; gap: 16px; font-size: 14px; color: var(--gray-500); margin-bottom: 12px; }
.detail-category { color: var(--primary); font-weight: 500; }
.detail-title { font-size: 28px; font-weight: 800; color: var(--gray-900); margin-bottom: 20px; line-height: 1.3; }
.detail-content { font-size: 16px; line-height: 1.8; color: var(--gray-700); }
.detail-content :deep(h2) { font-size: 22px; font-weight: 700; margin: 28px 0 12px; color: var(--gray-900); }
.detail-content :deep(h3) { font-size: 18px; font-weight: 600; margin: 20px 0 10px; color: var(--gray-900); }
.detail-content :deep(a) { color: var(--primary); text-decoration: underline; }
.detail-tags { margin-top: 24px; display: flex; gap: 8px; flex-wrap: wrap; }
.detail-tag { font-size: 13px; padding: 4px 12px; border-radius: 999px; background: var(--gray-100); color: var(--gray-600); }

[data-theme="dark"] .detail-title { color: var(--gray-50); }
[data-theme="dark"] .detail-content { color: var(--gray-400); }
[data-theme="dark"] .detail-content :deep(h2), [data-theme="dark"] .detail-content :deep(h3) { color: var(--gray-50); }
</style>
