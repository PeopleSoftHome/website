<template>
  <section :class="s.section">
    <h3 :class="s.sectionTitle">{{ t('comment.title') }} ({{ totalCount }})</h3>

    <CommentForm
      v-if="auth.isLoggedIn.value"
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

<script setup>
import { ref, inject, computed, onMounted } from 'vue';
import { commentApi } from '@/api/comment.js';
import CommentForm from '../CommentForm/CommentForm.vue';
import CommentItem from './CommentItem.vue';
import s from './CommentSection.module.css';

const props = defineProps({
  entityType: { type: String, required: true },
  entityId: { type: String, required: true },
});

const { t } = useI18n();
const auth = inject('auth', { isLoggedIn: { value: false }, user: { value: null } });
const authModal = inject('authModal', { open: () => {} });

const comments = ref([]);
const loading = ref(false);
const totalCount = computed(() => comments.value.length);

const openAuth = () => authModal.open();

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
