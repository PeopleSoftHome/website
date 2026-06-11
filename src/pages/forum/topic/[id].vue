<template>
  <div>

    <main :class="s.topicPage">
      <div class="container">
        <button :class="s.backBtn" @click="$router.push('/forum')">
          ← {{ t('forum.back') }}
        </button>

        <div v-if="topic" :class="s.topicDetail" class="reveal">
          <div :class="s.topicHeader">
            <h1 :class="s.topicTitle">{{ topic.title }}</h1>
            <div :class="s.topicMeta">
              <span>{{ topic.author?.name || t('comment.anonymous') }}</span>
              <span>{{ topic.category?.name }}</span>
              <span>{{ formatDate(topic.createdAt) }}</span>
            </div>
          </div>

          <div :class="s.topicContent" v-html="renderMarkdown(topic.content)" />

          <div :class="s.repliesSection">
            <h3>{{ t('forum.replies') }} ({{ replies.length }})</h3>

            <div v-if="auth.isLoggedIn.value && topic" :class="s.replyForm">
              <textarea
                v-model="replyContent"
                :class="s.replyTextarea"
                :placeholder="t('forum.replyPlaceholder')"
                rows="3"
              />
              <div :class="s.replyFormActions">
                <button :class="s.replySubmitBtn" :disabled="!replyContent.trim() || replySubmitting" @click="submitReply">
                  {{ replySubmitting ? t('comment.submitting') : t('comment.submit') }}
                </button>
              </div>
            </div>
            <div v-else-if="!auth.isLoggedIn.value" :class="s.replyLogin">
              <button :class="s.replyLoginBtn" @click="openAuth">{{ t('comment.loginToComment') }}</button>
            </div>

            <div v-for="reply in replies" :key="reply.id" :class="s.replyItem">
              <div :class="s.replyHeader">
                <Avatar :src="reply.author?.avatar" :name="reply.author?.name" :size="32" />
                <span :class="s.replyAuthor">{{ reply.author?.name || t('comment.anonymous') }}</span>
                <span :class="s.replyTime">{{ formatDate(reply.createdAt) }}</span>
              </div>
              <p :class="s.replyContent" v-html="renderMentions(reply.content)" />
            </div>
          </div>
        </div>

        <div v-else-if="loading" :class="s.topicLoading">
          <div :class="s.skeletonWrap">
            <div :class="s.skeletonLine" style="width:60%;height:24px" />
            <div :class="s.skeletonLine" style="width:40%;height:16px;margin-top:12px" />
            <div :class="s.skeletonLine" style="width:100%;height:120px;margin-top:20px" />
            <div :class="s.skeletonLine" style="width:100%;height:16px;margin-top:12px" />
            <div :class="s.skeletonLine" style="width:80%;height:16px;margin-top:8px" />
          </div>
        </div>
      </div>
    </main>

  </div>
</template>

<script setup>
import { ref, onUnmounted, inject, watch } from 'vue';
import { removeJsonLd } from '@/utils/jsonld.js';
import Avatar from '@/components/ui/Avatar/Avatar.vue';
import { forumApi } from '@/api/forum.js';
import { renderMarkdown, renderMentions } from '@/utils/markdown.js';
import { formatDate } from '@/utils/date.js';
import s from './[id].vue.module.css';

definePageMeta({ title: 'forum.detail', description: 'forum.subtitle' });

const { t } = useI18n();
const route = useRoute();
const auth = inject('auth', { isLoggedIn: { value: false }, user: { value: null } });
const authModal = inject('authModal', { open: () => {} });

const openAuth = () => authModal.open();

const { data: topic, pending: loading } = useAsyncData(
  `forum-topic-${route.params.id}`,
  async () => {
    const res = await forumApi.getTopic(route.params.id);
    return res.data || res;
  },
  { server: false, default: () => null }
);

useHead(() => {
  if (!topic.value) return {};
  return {
    title: `${topic.value.title} | TalentPro`,
    meta: [
      { name: 'description', content: topic.value.content?.slice(0, 160) || topic.value.title },
    ],
  };
});

const replies = ref([]);
watch(topic, (val) => {
  replies.value = val?.posts || [];
}, { immediate: true });

const replyContent = ref('');
const replySubmitting = ref(false);

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
    import('@/utils/toast.js').then(({ showToast }) => showToast(e.response?.data?.message || t('comment.submitError'), 'error'));
  }
  replySubmitting.value = false;
};

onUnmounted(removeJsonLd);
</script>
