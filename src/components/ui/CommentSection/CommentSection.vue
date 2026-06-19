<template>
  <section :class="s.section">
    <h3 :class="s.sectionTitle">{{ t('comment.title') }} ({{ totalCount }})</h3>

    <CommentForm
      v-if="auth.isLoggedIn"
      :entity-type="entityType"
      :entity-id="entityId"
      @submit="handleNewComment"
    />

    <div v-else :class="s.empty">
      <button :class="s.commentActionBtn" style="color:var(--primary);font-weight:600" @click="openAuth">
        {{ t('comment.loginToComment') }}
      </button>
    </div>

    <div :class="s.commentList">
      <CommentItem
        v-for="comment in comments"
        :key="comment.id"
        :comment="comment"
        :entity-type="entityType"
        :entity-id="entityId"
        @reply="handleNewReply"
      />
    </div>

    <div v-if="!comments.length && !loading" :class="s.empty">{{ t('comment.noComments') }}</div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth.pinia.js';
import { commentApi } from '@/api/comment.js';
import CommentForm from '../CommentForm/CommentForm.vue';
import CommentItem from './CommentItem.vue';
import s from './CommentSection.module.css';

const props = defineProps({
  entityType: { type: String, required: true },
  entityId: { type: String, required: true },
});

const { t } = useI18n();
const auth = useAuthStore();
const authOpen = useState('authOpen', () => false);

const comments = ref([]);
const loading = ref(false);
const totalCount = computed(() => comments.value.length);

const openAuth = () => { authOpen.value = true; };

const fetchComments = async () => {
  loading.value = true;
  try {
    const res = await commentApi.getComments(props.entityType, props.entityId);
    const data = res.data || res;
    comments.value = data.data || data || [];
  } catch {
    // ignore
  }
  loading.value = false;
};

const handleNewComment = (newComment) => {
  comments.value.unshift(newComment);
};

const handleNewReply = ({ parentId, reply }) => {
  const parent = comments.value.find((c) => c.id === parentId);
  if (parent) {
    if (!parent.replies) parent.replies = [];
    parent.replies.push(reply);
  }
};

onMounted(fetchComments);
</script>
