<template>
  <div>
    <NavBar />
    <main class="topic-page">
      <div class="container">
        <button class="back-btn" @click="$router.push('/forum')">
          <el-icon><ArrowLeft /></el-icon> {{ t('forum.back') }}
        </button>

        <div v-if="topic" class="topic-detail">
          <div class="topic-header">
            <h1 class="topic-title">{{ topic.title }}</h1>
            <div class="topic-meta">
              <span>{{ topic.author?.name || '匿名' }}</span>
              <span>{{ topic.category?.name }}</span>
              <span>{{ formatDate(topic.createdAt) }}</span>
            </div>
          </div>

          <div class="topic-content" v-html="renderMarkdown(topic.content)" />

          <div class="replies-section">
            <h3>{{ t('forum.replies') }} ({{ replies.length }})</h3>
            <div v-for="reply in replies" :key="reply.id" class="reply-item">
              <div class="reply-header">
                <el-avatar :size="32" :icon="UserFilled" />
                <span class="reply-author">{{ reply.author?.name || '匿名' }}</span>
                <span class="reply-time">{{ formatDate(reply.createdAt) }}</span>
              </div>
              <p class="reply-content">{{ reply.content }}</p>
            </div>
          </div>
        </div>

        <div v-else-if="loading" class="topic-loading">
          <el-skeleton :rows="6" animated />
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue';
import { useRoute } from 'vue-router';
import NavBar from '@/components/layout/NavBar/NavBar.vue';
import Footer from '@/components/layout/Footer/Footer.vue';
import { forumApi } from '@/api/forum.js';

const { t } = inject('i18n', { t: (k) => k });
const route = useRoute();

const topic = ref(null);
const replies = ref([]);
const loading = ref(false);

const fetchTopic = async () => {
  loading.value = true;
  try {
    const res = await forumApi.getTopic(route.params.id);
    topic.value = res.data || res;
    replies.value = topic.value?.posts || [];
  } catch (e) {
    console.error(e);
  }
  loading.value = false;
};

const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('zh-CN');
};

const renderMarkdown = (md) => {
  if (!md) return '';
  return md
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
};

onMounted(fetchTopic);
</script>

<style scoped>
.topic-page { padding: 40px 0 80px; background: var(--page-bg); min-height: 60vh; }
.back-btn { display: inline-flex; align-items: center; gap: 6px; margin-bottom: 24px; padding: 8px 16px; border-radius: var(--radius-pill); border: 1px solid var(--card-border); background: var(--card-bg); color: var(--gray-700); cursor: pointer; font-size: 14px; transition: all 0.2s; }
.back-btn:hover { border-color: var(--primary); color: var(--primary); }

.topic-detail { max-width: 800px; margin: 0 auto; }
.topic-header { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: var(--radius-lg); padding: 28px; margin-bottom: 16px; }
.topic-title { font-size: 24px; font-weight: 800; color: var(--gray-900); margin-bottom: 10px; }
.topic-meta { display: flex; gap: 16px; font-size: 14px; color: var(--gray-500); }

.topic-content { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: var(--radius-lg); padding: 28px; font-size: 16px; line-height: 1.8; color: var(--gray-700); margin-bottom: 16px; }
.topic-content :deep(a) { color: var(--primary); text-decoration: underline; }

.replies-section { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: var(--radius-lg); padding: 28px; }
.replies-section h3 { font-size: 18px; font-weight: 700; margin-bottom: 16px; color: var(--gray-900); }
.reply-item { padding: 16px 0; border-bottom: 1px solid var(--card-border); }
.reply-item:last-child { border-bottom: none; }
.reply-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.reply-author { font-weight: 600; font-size: 14px; color: var(--gray-900); }
.reply-time { font-size: 12px; color: var(--gray-500); }
.reply-content { font-size: 15px; color: var(--gray-700); line-height: 1.6; padding-left: 42px; }

[data-theme="dark"] .topic-title { color: var(--gray-50); }
[data-theme="dark"] .replies-section h3 { color: var(--gray-50); }
[data-theme="dark"] .reply-author { color: var(--gray-50); }
</style>
