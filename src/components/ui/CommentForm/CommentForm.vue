<template>
  <div :class="s.form">
    <MarkdownEditor
      v-model="content"
      :placeholder="placeholder || t('comment.placeholder')"
    />

    <div :class="s.actions">
      <button v-if="parentId" :class="s.cancelBtn" @click="$emit('cancel')">{{ t('comment.cancel') }}</button>
      <button :class="s.submitBtn" :disabled="!content.trim() || submitting" @click="submit">
        {{ submitting ? t('comment.submitting') : t('comment.submit') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth.pinia.js';
import { commentApi } from '@/api/comment.js';
import MarkdownEditor from '../MarkdownEditor/MarkdownEditor.vue';
import s from './CommentForm.module.css';

const props = defineProps({
  entityType: { type: String, required: true },
  entityId: { type: String, required: true },
  parentId: { type: String, default: '' },
  placeholder: { type: String, default: '' },
});

const emit = defineEmits(['submit', 'cancel']);

const { t } = useI18n();
const auth = useAuthStore();

const content = ref('');
const submitting = ref(false);

const submit = async () => {
  const text = content.value.trim();
  if (!text || submitting.value) return;

  submitting.value = true;
  try {
    const res = await commentApi.createComment({
      entityType: props.entityType,
      entityId: props.entityId,
      authorId: (auth.user as { id?: string } | null)?.id || 'guest',
      content: text,
      parentId: props.parentId || undefined,
    });
    const newComment = (res.data || res)?.data || res.data || res;
    emit('submit', newComment as Record<string, unknown>);
    content.value = '';
  } catch (e) {
    const err = e as { response?: { data?: { message?: string } } };
    import('@/utils/toast.js').then(({ showToast }) => showToast(err.response?.data?.message || t('comment.submitError'), 'error'));
  }
  submitting.value = false;
};
</script>
