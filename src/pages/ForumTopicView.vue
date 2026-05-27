<template>
  <div>
    <NavBar />
    <main class="topic-page">
      <div class="container">
        <button class="back-btn" @click="$router.push('/forum')">
          ← {{ t('forum.back') }}
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

            <div v-if="auth.isLoggedIn.value && topic" class="reply-form">
              <textarea
                v-model="replyContent"
                class="reply-textarea"
                :placeholder="t('forum.replyPlaceholder')"
                rows="3"
              />
              <div class="reply-form-actions">
                <button class="reply-submit-btn" :disabled="!replyContent.trim() || replySubmitting" @click="submitReply">
                  {{ replySubmitting ? t('comment.submitting') : t('comment.submit') }}
                </button>
              </div>
            </div>
            <div v-else-if="!auth.isLoggedIn.value" class="reply-login">
              <button class="reply-login-btn" @click="openAuth">{{ t('comment.loginToComment') }}</button>
            </div>

            <div v-for="reply in replies" :key="reply.id" class="reply-item">
              <div class="reply-header">
                <Avatar :src="reply.author?.avatar" :name="reply.author?.name" :size="32" />
                <span class="reply-author">{{ reply.author?.name || '匿名' }}</span>
                <span class="reply-time">{{ formatDate(reply.createdAt) }}</span>
              </div>
              <p class="reply-content" v-html="renderMentions(reply.content)" />
            </div>
          </div>
        </div>

        <div v-else-if="loading" class="topic-loading">
          <div class="skeleton-wrap">
            <div class="skeleton-line" style="width:60%;height:24px" />
            <div class="skeleton-line" style="width:40%;height:16px;margin-top:12px" />
            <div class="skeleton-line" style="width:100%;height:120px;margin-top:20px" />
            <div class="skeleton-line" style="width:100%;height:16px;margin-top:12px" />
            <div class="skeleton-line" style="width:80%;height:16px;margin-top:8px" />
          </div>
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
import Avatar from '@/components/ui/Avatar/Avatar.vue';
import { forumApi } from '@/api/forum.js';
import { escapeHtml, renderMarkdown } from '@/utils/markdown.js';

const { t } = inject('i18n', { t: (k) => k });
const route = useRoute();
const auth = inject('auth', { isLoggedIn: { value: false }, user: { value: null } });
const authModal = inject('authModal', { open: () => {} });

const openAuth = () => authModal.open();

const topic = ref(null);
const replies = ref([]);
const loading = ref(false);
const replyContent = ref('');
const replySubmitting = ref(false);

const fetchTopic = async () => {
  loading.value = true;
  try {
    const res = await forumApi.getTopic(route.params.id);
    topic.value = res.data || res;
    replies.value = topic.value?.posts || [];
    if (topic.value) {
      document.title = `${topic.value.title} | TalentPro 论坛`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', topic.value.content?.slice(0, 160) || topic.value.title);
    }
  } catch (e) {
    console.error(e);
  }
  loading.value = false;
};

const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('zh-CN');
};

const renderMentions = (text) => {
  if (!text) return '';
  return escapeHtml(text)
    .replace(/@([\u4e00-\u9fa5a-zA-Z0-9_]+)/g, '<span class="mention-highlight">@$1</span>');
};

const submitReply = async () => {
  if (!replyContent.value.trim() || replySubmitting.value) return;
  replySubmitting.value = true;
  try {
    const res = await forumApi.createPost({
      topicId: topic.value.id,
      authorId: auth.user.value?.id || 'guest',
      content: replyContent.value.trim(),
    });
    const newReply = (res.data || res)?.data || res.data || res;
    replies.value.push(newReply);
    replyContent.value = '';
  } catch (e) {
    alert(e.response?.data?.message || t('comment.submitError'));
  }
  replySubmitting.value = false;
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
.reply-content :deep(.mention-highlight) { color: var(--primary); font-weight: 600; }
.reply-login { padding: 16px 0; text-align: center; }
.reply-login-btn { background: none; border: none; color: var(--primary); font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; }
.reply-form { margin-bottom: 20px; }
.reply-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-md);
  font-size: 15px;
  font-family: inherit;
  color: var(--gray-900);
  background: var(--card-bg);
  resize: vertical;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.reply-textarea:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-glow); }
.reply-form-actions { display: flex; justify-content: flex-end; margin-top: 8px; }
.reply-submit-btn {
  padding: 8px 18px;
  border-radius: var(--radius-md);
  border: none;
  background: var(--primary);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}
.reply-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
[data-theme="dark"] .reply-textarea { color: var(--input-color); border-color: var(--input-border); }
.skeleton-wrap { display: flex; flex-direction: column; }
.skeleton-line { background: var(--gray-100); border-radius: var(--radius-sm); animation: pulse 1.5s infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
[data-theme="dark"] .skeleton-line { background: var(--gray-800); }

[data-theme="dark"] .topic-title { color: var(--gray-50); }
[data-theme="dark"] .replies-section h3 { color: var(--gray-50); }
[data-theme="dark"] .reply-author { color: var(--gray-50); }
</style>
