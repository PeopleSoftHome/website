<template>
  <div>
    <NavBar />
    <main class="forum-page">
      <div class="container">
        <h1 class="page-title">{{ t('forum.title') }}</h1>

        <div class="forum-categories">
          <button
            v-for="cat in categories"
            :key="cat.id"
            :class="['cat-btn', activeCategory === cat.id ? 'cat-active' : '']"
            @click="setCategory(cat.id)"
          >
            {{ cat.name }}
          </button>
        </div>

        <div v-if="loading" class="forum-loading">
          <el-skeleton :rows="3" animated v-for="i in 3" :key="i" />
        </div>

        <div v-else-if="topics.length" class="topic-list">
          <div
            v-for="topic in topics"
            :key="topic.id"
            class="topic-item"
            @click="goToTopic(topic.id)"
          >
            <div class="topic-left">
              <el-avatar :size="40" :icon="UserFilled" />
              <div class="topic-info">
                <h3 class="topic-title">
                  <el-tag v-if="topic.isPinned" size="small" type="danger" style="margin-right:6px">置顶</el-tag>
                  <el-tag v-if="topic.isLocked" size="small" type="info" style="margin-right:6px">已锁定</el-tag>
                  {{ topic.title }}
                </h3>
                <p class="topic-meta">
                  <span>{{ topic.category?.name }}</span>
                  <span>{{ topic.author?.name || '匿名' }}</span>
                  <span>{{ formatDate(topic.createdAt) }}</span>
                </p>
              </div>
            </div>
            <div class="topic-stats">
              <span><el-icon><ChatDotSquare /></el-icon> {{ topic._count?.posts || 0 }}</span>
              <span><el-icon><View /></el-icon> {{ topic.viewCount || 0 }}</span>
            </div>
          </div>
        </div>

        <div v-else class="forum-empty">
          <p>{{ t('forum.noTopics') }}</p>
        </div>

        <el-pagination
          v-if="total > pageSize"
          layout="prev, pager, next"
          :total="total"
          :page-size="pageSize"
          v-model:current-page="page"
          @current-change="fetchTopics"
          class="forum-pagination"
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
import { forumApi } from '@/api/forum.js';

const { t } = inject('i18n', { t: (k) => k });
const router = useRouter();

const topics = ref([]);
const categories = ref([]);
const total = ref(0);
const page = ref(1);
const pageSize = 15;
const loading = ref(false);
const activeCategory = ref(null);

const setCategory = (id) => {
  activeCategory.value = activeCategory.value === id ? null : id;
  page.value = 1;
  fetchTopics();
};

const fetchTopics = async () => {
  loading.value = true;
  try {
    const res = await forumApi.getTopics({
      page: page.value,
      pageSize,
      categoryId: activeCategory.value || undefined,
    });
    topics.value = res.data?.items || res.items || [];
    total.value = res.data?.total || res.total || 0;
  } catch (e) {
    console.error(e);
  }
  loading.value = false;
};

const fetchCategories = async () => {
  try {
    const res = await forumApi.getCategories();
    categories.value = res.data || res || [];
  } catch (e) {
    console.error(e);
  }
};

const goToTopic = (id) => {
  router.push(`/forum/topic/${id}`);
};

const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('zh-CN');
};

onMounted(() => {
  fetchCategories();
  fetchTopics();
});
</script>

<style scoped>
.forum-page { padding: 40px 0 80px; background: var(--page-bg); min-height: 60vh; }
.page-title { font-size: 32px; font-weight: 800; color: var(--gray-900); margin-bottom: 24px; }

.forum-categories { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 32px; }
.cat-btn { padding: 8px 16px; border-radius: 999px; border: 1px solid var(--gray-200); background: var(--card-bg); color: var(--gray-700); cursor: pointer; font-size: 14px; transition: all 0.2s; }
.cat-btn:hover { border-color: var(--primary); color: var(--primary); }
.cat-active { background: var(--primary); color: #fff; border-color: var(--primary); }

.topic-list { display: flex; flex-direction: column; gap: 12px; }
.topic-item { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: var(--card-bg); border: 1px solid var(--card-border); border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s; }
.topic-item:hover { border-color: var(--primary); box-shadow: var(--shadow-sm); }
.topic-left { display: flex; align-items: center; gap: 12px; }
.topic-info { display: flex; flex-direction: column; gap: 4px; }
.topic-title { font-size: 16px; font-weight: 600; color: var(--gray-900); margin: 0; }
.topic-meta { font-size: 13px; color: var(--gray-500); display: flex; gap: 12px; }
.topic-stats { display: flex; gap: 16px; font-size: 13px; color: var(--gray-500); }
.topic-stats span { display: flex; align-items: center; gap: 4px; }

.forum-empty { text-align: center; padding: 60px 0; color: var(--gray-500); }
.forum-loading { display: flex; flex-direction: column; gap: 16px; }
.forum-pagination { margin-top: 40px; justify-content: center; }

[data-theme="dark"] .page-title { color: var(--gray-50); }
[data-theme="dark"] .topic-title { color: var(--gray-50); }
</style>
