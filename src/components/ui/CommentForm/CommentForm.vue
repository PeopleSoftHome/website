<template>
  <div :class="s.form">
    <div :class="s.inputWrap">
      <textarea
        ref="textareaRef"
        v-model="content"
        :class="s.textarea"
        :placeholder="placeholder || t('comment.placeholder')"
        @input="handleInput"
        @keydown="handleKeydown"
      />

      <div v-if="mentionOpen" :class="s.mentionDropdown">
        <div
          v-for="(user, i) in mentionUsers"
          :key="user.id"
          :class="[s.mentionItem, i === mentionIndex ? s.mentionItemActive : '']"
          @click="selectMention(user)"
        >
          <Avatar :src="user.avatar" :name="user.name" :size="24" />
          <span :class="s.mentionName">{{ user.name }}</span>
          <span :class="s.mentionEmail">{{ user.email }}</span>
        </div>
        <div v-if="mentionLoading" :class="s.mentionItem">{{ t('comment.loading') }}</div>
        <div v-if="!mentionUsers.length && !mentionLoading" :class="s.mentionItem">{{ t('comment.noUser') }}</div>
      </div>
    </div>

    <div :class="s.actions">
      <button v-if="parentId" :class="s.cancelBtn" @click="$emit('cancel')">{{ t('comment.cancel') }}</button>
      <button :class="s.submitBtn" :disabled="!content.trim() || submitting" @click="submit">
        {{ submitting ? t('comment.submitting') : t('comment.submit') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue';
import { commentApi } from '@/api/comment.js';
import { userApi } from '@/api/user.js';
import Avatar from '../Avatar/Avatar.vue';
import s from './CommentForm.module.css';

const props = defineProps({
  entityType: { type: String, required: true },
  entityId: { type: String, required: true },
  parentId: { type: String, default: '' },
  placeholder: { type: String, default: '' },
});

const emit = defineEmits(['submit', 'cancel']);

const { t } = inject('i18n', { t: (k) => k });
const auth = inject('auth', { user: { value: null } });

const content = ref('');
const submitting = ref(false);
const textareaRef = ref(null);

// Mention autocomplete state
const mentionOpen = ref(false);
const mentionQuery = ref('');
const mentionUsers = ref([]);
const mentionLoading = ref(false);
const mentionIndex = ref(0);
let mentionTimer = null;
let mentionStartPos = -1;

const handleInput = () => {
  const text = content.value;
  const cursorPos = textareaRef.value.selectionStart;
  const beforeCursor = text.slice(0, cursorPos);
  const atIndex = beforeCursor.lastIndexOf('@');

  if (atIndex !== -1 && atIndex === mentionStartPos) {
    const query = beforeCursor.slice(atIndex + 1);
    if (query.includes(' ')) {
      closeMention();
      return;
    }
    mentionQuery.value = query;
    searchMentions(query);
  } else if (atIndex !== -1 && !beforeCursor.slice(atIndex + 1).includes(' ')) {
    mentionStartPos = atIndex;
    mentionQuery.value = beforeCursor.slice(atIndex + 1);
    searchMentions(mentionQuery.value);
  } else {
    closeMention();
  }
};

const searchMentions = (q) => {
  clearTimeout(mentionTimer);
  if (!q) { mentionUsers.value = []; return; }
  mentionLoading.value = true;
  mentionOpen.value = true;
  mentionIndex.value = 0;

  mentionTimer = setTimeout(async () => {
    try {
      const res = await userApi.searchUsers(q, 6);
      const data = res.data || res;
      mentionUsers.value = data.data || data || [];
    } catch (e) {
      mentionUsers.value = [];
    }
    mentionLoading.value = false;
  }, 150);
};

const closeMention = () => {
  mentionOpen.value = false;
  mentionUsers.value = [];
  mentionStartPos = -1;
};

const selectMention = (user) => {
  const text = content.value;
  const before = text.slice(0, mentionStartPos);
  const after = text.slice(textareaRef.value.selectionStart);
  content.value = `${before}@${user.name} ${after}`;
  closeMention();
  textareaRef.value.focus();
};

const handleKeydown = (e) => {
  if (!mentionOpen.value) return;
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    mentionIndex.value = (mentionIndex.value + 1) % mentionUsers.value.length;
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    mentionIndex.value = (mentionIndex.value - 1 + mentionUsers.value.length) % mentionUsers.value.length;
  } else if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    const user = mentionUsers.value[mentionIndex.value];
    if (user) selectMention(user);
  } else if (e.key === 'Escape') {
    closeMention();
  }
};

const submit = async () => {
  const text = content.value.trim();
  if (!text || submitting.value) return;

  submitting.value = true;
  try {
    const res = await commentApi.createComment({
      entityType: props.entityType,
      entityId: props.entityId,
      authorId: auth.user.value?.id || 'guest',
      content: text,
      parentId: props.parentId || undefined,
    });
    const newComment = (res.data || res)?.data || res.data || res;
    emit('submit', newComment);
    content.value = '';
  } catch (e) {
    console.error(e);
    alert(e.response?.data?.message || t('comment.submitError'));
  }
  submitting.value = false;
};
</script>
