<template>
  <div>

    <main :class="s.blogPage">
      <div class="container">
        <h1 :class="s.pageTitle">{{ t('blog.title') }}</h1>
        <div :class="s.blogCategories">
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
          <button :class="s.retryBtn" @click="fetchPosts">{{ t('common.retry') }}</button>
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
          @change="fetchPosts"
        />
      </div>
    </main>

  </div>
</template>

<script setup>
definePageMeta({ title: 'blog.pageTitle' });
import { ref, onMounted, onUnmounted, inject } from 'vue';
import { useRouter } from 'vue-router';
import Skeleton from '@/components/ui/Skeleton/Skeleton.vue';
import Pagination from '@/components/ui/Pagination/Pagination.vue';
import { blogApi } from '@/api/blog.js';
import { formatDate } from '@/utils/date.js';
import { injectJsonLd, removeJsonLd } from '@/utils/jsonld.js';
import s from './BlogListView.module.css';
import { BLOG_PAGE_SIZE } from '@/constants/pagination.js';

const { t } = inject('i18n', { t: (k) => k });
const router = useRouter();

const posts = ref([]);
const categories = ref([]);
const total = ref(0);
const page = ref(1);
const pageSize = BLOG_PAGE_SIZE;

const loading = ref(false);
const error = ref(null);
const activeCategory = ref(null);

const setCategory = (slug) => {
  activeCategory.value = activeCategory.value === slug ? null : slug;
  page.value = 1;
  fetchPosts();
};

const fetchPosts = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await blogApi.getPosts({
      page: page.value,
      pageSize,
      category: activeCategory.value || undefined,
      status: 'PUBLISHED',
    });
    posts.value = res.data || [];
    total.value = res.meta?.total || 0;
  } catch (e) {
    error.value = e.response?.data?.message || t('common.loadError');
  }
  loading.value = false;
};

const fetchCategories = async () => {
  try {
    const res = await blogApi.getCategories();
    categories.value = res.data || res || [];
  } catch (e) {
    if (import.meta.env.DEV) console.error(e);
  }
};

const goToPost = (slug) => {
  router.push(`/blog/${slug}`);
};

const truncate = (text, len) => {
  if (!text) return '';
  return text.length > len ? text.slice(0, len) + '...' : text;
};

onMounted(() => {
  fetchCategories();
  fetchPosts();
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
