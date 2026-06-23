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

            <div v-if="auth.isLoggedIn && topic" :class="s.replyForm">
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
            <div v-else-if="!auth.isLoggedIn" :class="s.replyLogin">
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

<script setup lang="ts">
import { computed, ref, onUnmounted, watch } from 'vue';
import { useAuthStore } from '@/stores/auth.pinia';
import { removeJsonLd } from '@/utils/jsonld';
import Avatar from '@/components/ui/Avatar/Avatar.vue';
import { forumApi } from '@/api/forum';
import { renderMarkdown, renderMentions } from '@/utils/markdown';
import { formatDate } from '@/utils/date';
import { FORUM_TOPIC_MAP } from '@/data/forum';
import s from './[id].module.css';

definePageMeta({ title: 'forum.detail', description: 'forum.subtitle' });

interface Reply {
  id: string;
  author?: { name?: string; avatar?: string };
  createdAt: string;
  content: string;
}

interface Topic {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author?: { name?: string };
  category?: { name?: string };
  posts?: Reply[];
}

const { t } = useI18n();
const route = useRoute();
const id = computed(() => route.params.id);
const auth = useAuthStore();
const authOpen = useState('authOpen', () => false);

const openAuth = () => { authOpen.value = true; };

const { data: topic, pending: loading } = useAsyncData(
  () => `forum-topic-${id.value}`,
  async () => {
    try {
      const res = await forumApi.getTopic(id.value as string);
      const data = res.data || res;
      if (data) return data as Topic;
    } catch (e) {
      // API 不可用时降级到静态 fallback
    }
    return (FORUM_TOPIC_MAP as Record<string, Topic>)[id.value as string] || null;
  },
  { server: false, default: () => null as Topic | null, watch: [id] }
);

useHead(() => {
  if (!topic.value) return {};
  const tpc = topic.value as Topic;
  return {
    title: `${tpc.title} | TalentPro`,
    meta: [
      { name: 'description', content: tpc.content?.slice(0, 160) || tpc.title },
    ],
  };
});

const replies = ref<Reply[]>([]);
watch(topic, (val) => {
  replies.value = (val as Topic | null)?.posts || [];
}, { immediate: true });

const replyContent = ref('');
const replySubmitting = ref(false);

const submitReply = async () => {
  if (!replyContent.value.trim() || replySubmitting.value) return;
  replySubmitting.value = true;
  try {
    const tpc = topic.value as Topic;
    const res = await forumApi.createPost({
      topicId: tpc.id,
      authorId: (auth.user as { id?: string } | null)?.id || 'guest',
      content: replyContent.value.trim(),
    });
    const newReply = ((res.data || res)?.data || res.data || res) as Reply;
    replies.value.push(newReply);
    replyContent.value = '';
  } catch (e) {
    const err = e as { response?: { data?: { message?: string } } };
    import('@/utils/toast').then(({ showToast }) => showToast(err.response?.data?.message || t('comment.submitError'), 'error'));
  }
  replySubmitting.value = false;
};

onUnmounted(removeJsonLd);
</script>
