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
import { ref, computed } from 'vue';
import Skeleton from '@/components/ui/Skeleton/Skeleton.vue';
import Pagination from '@/components/ui/Pagination/Pagination.vue';
import { blogApi } from '@/api/blog';
import { formatDate } from '@/shared/utils/date';
import { useJsonLd } from '@/shared/utils/jsonld';
import { usePagedList } from '@/shared/composables/usePagedList';
import s from './index.module.css';
import { BLOG_PAGE_SIZE } from '@/constants/pagination';
import { getBlogPosts, getBlogCategories } from '@/data/blog';

const { t, locale } = useI18n();

const pageSize = BLOG_PAGE_SIZE;
const activeCategory = ref<string | null>(null);

const blogPosts = computed(() => getBlogPosts(locale.value));
const blogCategories = computed(() => getBlogCategories(locale.value));

interface BlogPostItem {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  createdAt: string;
  category?: { name: string; slug?: string; id?: string };
  tags?: { id: string; name: string }[];
}

const fallbackPosts = computed<BlogPostItem[]>(() => {
  let list = blogPosts.value as BlogPostItem[];
  if (activeCategory.value) {
    list = list.filter((p) => p.category?.slug === activeCategory.value || p.category?.id === activeCategory.value);
  }
  return list;
});

const { items: posts, total, page, isLoading: loading, error, refresh: fetchPosts, resetPage } =
  usePagedList<BlogPostItem>({
    key: () => `blog-posts-${locale.value}`,
    fetchFn: ({ page: p, pageSize: ps }) => blogApi.getPosts({
      page: p,
      pageSize: ps,
      category: activeCategory.value || undefined,
      status: 'PUBLISHED',
    }),
    pageSize,
    watchSources: [activeCategory, locale],
    fallbackData: fallbackPosts,
  });

const { data: catRes } = useAsyncData(
  () => `blog-categories-${locale.value}`,
  () => blogApi.getCategories(),
  { default: () => ({ data: blogCategories.value }), watch: [locale] }
);
const apiCategories = computed(() => catRes.value?.data || catRes.value || []);
const categories = computed(() => apiCategories.value.length > 0 ? apiCategories.value : blogCategories.value);

const setCategory = (slug: string) => {
  activeCategory.value = activeCategory.value === slug ? null : slug;
  resetPage();
  fetchPosts();
};

const goToPost = (slug: string) => {
  navigateTo(`/blog/${slug}`);
};

const truncate = (text: string | undefined, len: number): string => {
  if (!text) return '';
  return text.length > len ? text.slice(0, len) + '...' : text;
};

useJsonLd({
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
</script>
