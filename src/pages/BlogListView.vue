<template>
  <div>
    <NavBar />
    <main class="blog-page">
      <div class="container">
        <h1 class="page-title">{{ t('blog.title') }}</h1>
        <div class="blog-categories">
          <button
            v-for="cat in categories"
            :key="cat.id"
            :class="['cat-btn', activeCategory === cat.id ? 'cat-active' : '']"
            @click="setCategory(cat.id)"
          >
            {{ cat.name }}
          </button>
        </div>

        <div v-if="loading" class="blog-loading">
          <div v-for="i in 3" :key="i" class="skeleton-card">
            <Skeleton width="100%" height="180px" radius="var(--radius-md)" />
            <div style="padding:16px 0;display:flex;flex-direction:column;gap:10px">
              <Skeleton width="60%" height="16px" />
              <Skeleton width="40%" height="14px" />
              <Skeleton width="100%" height="14px" />
            </div>
          </div>
        </div>

        <div v-else-if="posts.length" class="blog-grid">
          <article
            v-for="post in posts"
            :key="post.id"
            class="blog-card"
            @click="goToPost(post.slug)"
          >
            <div v-if="post.coverImage" class="blog-cover" :style="{ backgroundImage: `url(${post.coverImage})` }" />
            <div class="blog-body">
              <div class="blog-meta">
                <span class="blog-category">{{ post.category?.name }}</span>
                <span class="blog-date">{{ formatDate(post.createdAt) }}</span>
              </div>
              <h2 class="blog-post-title">{{ post.title }}</h2>
              <p class="blog-excerpt">{{ post.excerpt || truncate(post.content, 120) }}</p>
              <div class="blog-tags">
                <span v-for="tag in (post.tags || [])" :key="tag.id" class="blog-tag">{{ tag.name }}</span>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="blog-empty">
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
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue';
import { useRouter } from 'vue-router';
import NavBar from '@/components/layout/NavBar/NavBar.vue';
import Footer from '@/components/layout/Footer/Footer.vue';
import Skeleton from '@/components/ui/Skeleton/Skeleton.vue';
import Pagination from '@/components/ui/Pagination/Pagination.vue';
import { blogApi } from '@/api/blog.js';

const { t } = inject('i18n', { t: (k) => k });
const router = useRouter();

const posts = ref([]);
const categories = ref([]);
const total = ref(0);
const page = ref(1);
const pageSize = 9;
const loading = ref(false);
const activeCategory = ref(null);

const setCategory = (id) => {
  activeCategory.value = activeCategory.value === id ? null : id;
  page.value = 1;
  fetchPosts();
};

const fetchPosts = async () => {
  loading.value = true;
  try {
    const res = await blogApi.getPosts({
      page: page.value,
      pageSize,
      category: activeCategory.value || undefined,
      status: 'PUBLISHED',
    });
    posts.value = res.data?.items || res.items || [];
    total.value = res.data?.total || res.total || 0;
  } catch (e) {
    console.error(e);
  }
  loading.value = false;
};

const fetchCategories = async () => {
  try {
    const res = await blogApi.getCategories();
    categories.value = res.data || res || [];
  } catch (e) {
    console.error(e);
  }
};

const goToPost = (slug) => {
  router.push(`/blog/${slug}`);
};

const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('zh-CN');
};

const truncate = (text, len) => {
  if (!text) return '';
  return text.length > len ? text.slice(0, len) + '...' : text;
};

onMounted(() => {
  fetchCategories();
  fetchPosts();
});
</script>

<style scoped>
.blog-page { padding: 40px 0 80px; background: var(--page-bg); min-height: 60vh; }
.page-title { font-size: 32px; font-weight: 800; color: var(--gray-900); margin-bottom: 24px; }

.blog-categories { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 32px; }
.cat-btn { padding: 8px 16px; border-radius: 999px; border: 1px solid var(--gray-200); background: var(--card-bg); color: var(--gray-700); cursor: pointer; font-size: 14px; transition: all 0.2s; }
.cat-btn:hover { border-color: var(--primary); color: var(--primary); }
.cat-active { background: var(--primary); color: #fff; border-color: var(--primary); }

.blog-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
.blog-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: var(--radius-lg); overflow: hidden; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
.blog-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
.blog-cover { height: 180px; background-size: cover; background-position: center; }
.blog-body { padding: 20px; }
.blog-meta { display: flex; gap: 12px; font-size: 13px; color: var(--gray-500); margin-bottom: 10px; }
.blog-category { color: var(--primary); font-weight: 500; }
.blog-post-title { font-size: 18px; font-weight: 700; color: var(--gray-900); margin-bottom: 8px; line-height: 1.4; }
.blog-excerpt { font-size: 14px; color: var(--gray-600); line-height: 1.6; margin-bottom: 12px; }
.blog-tags { display: flex; gap: 6px; flex-wrap: wrap; }
.blog-tag { font-size: 12px; padding: 3px 10px; border-radius: 999px; background: var(--gray-100); color: var(--gray-600); }

.blog-empty { text-align: center; padding: 60px 0; color: var(--gray-500); }
.blog-loading { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
.skeleton-card { display: flex; flex-direction: column; }

[data-theme="dark"] .page-title { color: var(--gray-50); }
[data-theme="dark"] .blog-post-title { color: var(--gray-50); }
</style>
