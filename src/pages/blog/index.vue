<template>
  <div>

    <main :class="s.blogPage">
      <div class="container">
        <h1 :class="s.pageTitle" class="reveal">{{ t('blog.title') }}</h1>
        <div :class="s.blogCategories" class="reveal reveal-delay-1">
          <button
            v-for="cat in categories"
            :key="cat.id"
            :class="[s.catBtn, activeCategory === cat.slug ? s.catActive : '']"
            @click="setCategory(cat.slug)"
          >
            {{ cat.name }}
          </button>
        </div>

        <div v-if="loading" :class="s.blogLoading">
          <div v-for="i in 3" :key="i" :class="s.skeletonCard">
            <Skeleton width="100%" height="180px" radius="var(--radius-md)" />
            <div style="padding:16px 0;display:flex;flex-direction:column;gap:10px">
              <Skeleton width="60%" height="16px" />
              <Skeleton width="40%" height="14px" />
              <Skeleton width="100%" height="14px" />
            </div>
          </div>
        </div>

        <div v-else-if="error" :class="s.errorBox">
          <p>{{ error }}</p>
          <button :class="s.retryBtn" @click="() => fetchPosts()">{{ t('common.retry') }}</button>
        </div>

        <div v-else-if="posts.length" :class="s.blogGrid">
          <article
            v-for="post in posts"
            :key="post.id"
            :class="s.blogCard"
            @click="goToPost(post.slug)"
          >
            <div v-if="post.coverImage" :class="s.blogCover" :style="{ backgroundImage: `url(${post.coverImage})` }" />
            <div :class="s.blogBody">
              <div :class="s.blogMeta">
                <span :class="s.blogCategory">{{ post.category?.name }}</span>
                <span class="blog-date">{{ formatDate(post.createdAt) }}</span>
              </div>
              <h2 :class="s.blogPostTitle">{{ post.title }}</h2>
              <p :class="s.blogExcerpt">{{ post.excerpt || truncate(post.content, 120) }}</p>
              <div :class="s.blogTags">
                <span v-for="tag in (post.tags || [])" :key="tag.id" :class="s.blogTag">{{ tag.name }}</span>
              </div>
            </div>
          </article>
        </div>

        <div v-else :class="s.blogEmpty">
          <p>{{ t('blog.noPosts') }}</p>
        </div>

        <Pagination
          v-if="total > pageSize"
          :total="total"
          :page-size="pageSize"
          v-model="page"
          @change="() => fetchPosts()"
        />
      </div>
    </main>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ title: 'blog.pageTitle' });
import { ref, onMounted, onUnmounted, computed } from 'vue';
import Skeleton from '@/components/ui/Skeleton/Skeleton.vue';
import Pagination from '@/components/ui/Pagination/Pagination.vue';
import { blogApi } from '@/api/blog';
import { formatDate } from '@/utils/date';
import { injectJsonLd, removeJsonLd } from '@/utils/jsonld';
import s from './index.module.css';
import { BLOG_PAGE_SIZE } from '@/constants/pagination';
import { getBlogPosts, getBlogCategories } from '@/data/blog';

const { t, locale } = useI18n();

const page = ref(1);
const activeCategory = ref<string | null>(null);
const pageSize = BLOG_PAGE_SIZE;

const blogPosts = computed(() => getBlogPosts(locale.value));
const blogCategories = computed(() => getBlogCategories(locale.value));

const { data: postsRes, pending: loading, error, refresh: fetchPosts } = useAsyncData(
  () => `blog-posts-${locale.value}`,
  () => blogApi.getPosts({
    page: page.value,
    pageSize,
    category: activeCategory.value || undefined,
    status: 'PUBLISHED',
  }),
  { server: false, default: () => ({ data: [], meta: { total: 0 } }), watch: [page, activeCategory, locale] }
);

const fallbackPosts = computed(() => {
  let list = blogPosts.value;
  if (activeCategory.value) {
    list = list.filter((p) => p.category?.slug === activeCategory.value || p.category?.id === activeCategory.value);
  }
  return list;
});
const hasApiPosts = computed(() => Array.isArray(postsRes.value?.data) && postsRes.value.data.length > 0);
const posts = computed(() => hasApiPosts.value ? postsRes.value.data : fallbackPosts.value);
const total = computed(() => hasApiPosts.value ? ((postsRes.value as any)?.meta?.total || 0) : fallbackPosts.value.length);

const { data: catRes } = useAsyncData(
  () => `blog-categories-${locale.value}`,
  () => blogApi.getCategories(),
  { server: false, default: () => ({ data: blogCategories.value }), watch: [locale] }
);
const apiCategories = computed(() => catRes.value?.data || catRes.value || []);
const categories = computed(() => apiCategories.value.length > 0 ? apiCategories.value : blogCategories.value);

const setCategory = (slug: string) => {
  activeCategory.value = activeCategory.value === slug ? null : slug;
  page.value = 1;
  fetchPosts();
};

const goToPost = (slug: string) => {
  navigateTo(`/blog/${slug}`);
};

const truncate = (text: string, len: number): string => {
  if (!text) return '';
  return text.length > len ? text.slice(0, len) + '...' : text;
};

onMounted(() => {
  injectJsonLd({
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: t('blog.jsonLdName'),
    description: t('blog.jsonLdDesc'),
    url: 'https://talentpro.cn/blog',
    publisher: {
      '@type': 'Organization',
      name: 'TalentPro',
      logo: { '@type': 'ImageObject', url: 'https://talentpro.cn/logo.png' },
    },
  });
});
onUnmounted(removeJsonLd);
</script>
