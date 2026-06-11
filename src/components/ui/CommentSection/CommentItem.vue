<template>
  <div :class="s.commentItem">
    <Avatar :src="comment.author?.avatar" :name="comment.author?.name" :size="36" />
    <div :class="s.commentBody">
      <div :class="s.commentHeader">
        <span :class="s.commentAuthor">{{ comment.author?.name || t('comment.anonymous') }}</span>
        <span :class="s.commentTime">{{ formatTime(comment.createdAt) }}</span>
      </div>
      <div :class="s.commentContent" v-html="renderMentions(comment.content)" />
      <div :class="s.commentActions">
        <button :class="s.commentActionBtn" @click="replying = !replying">
          {{ replying ? t('comment.cancel') : t('comment.reply') }}
        </button>
      </div>

      <CommentForm
        v-if="replying"
        :entity-type="entityType"
        :entity-id="entityId"
        :parent-id="comment.id"
        :placeholder="t('comment.replyPlaceholder')"
        @submit="handleReply"
        @cancel="replying = false"
      />

      <div v-if="comment.replies?.length" :class="s.repliesWrap">
        <CommentItem
          v-for="reply in comment.replies"
          :key="reply.id"
          :comment="reply"
          :entity-type="entityType"
          :entity-id="entityId"
          is-nested
          @reply="$emit('reply', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue';
import Avatar from '../Avatar/Avatar.vue';
import CommentForm from '../CommentForm/CommentForm.vue';
import s from './CommentSection.module.css';

defineProps({
  comment: { type: Object, required: true },
  entityType: { type: String, required: true },
  entityId: { type: String, required: true },
  isNested: { type: Boolean, default: false },
});

const emit = defineEmits(['reply']);
import { renderMentions } from '@/utils/markdown.js';

const { t } = useI18n();

const replying = ref(false);

const handleReply = (reply) => {
  emit('reply', { parentId: reply.parentId, reply });
  replying.value = false;
};
</script>
