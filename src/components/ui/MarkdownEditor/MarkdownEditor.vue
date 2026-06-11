<template>
  <div :class="s.editor">
    <div :class="s.toolbar">
      <button :class="s.toolBtn" title="Bold" @click="wrap('**', '**')">B</button>
      <button :class="s.toolBtn" title="Italic" @click="wrap('*', '*')">I</button>
      <button :class="s.toolBtn" title="Link" @click="wrap('[', '](url)')">🔗</button>
      <button :class="s.toolBtn" title="Quote" @click="prefix('> ')">"</button>
      <button :class="s.toolBtn" title="Code" @click="wrap('`', '`')">&lt;/&gt;</button>
      <button :class="s.toolBtn" title="Code Block" @click="wrap('```\n', '\n```')">📄</button>
      <button :class="s.toolBtn" title="Image" @click="wrap('![alt](', ')')">🖼</button>
    </div>

    <div :class="s.inputWrap">
      <textarea
        v-if="mode === 'edit'"
        ref="textareaRef"
        :value="modelValue"
        :class="s.textarea"
        :placeholder="placeholder"
        @input="onInput"
        @keydown="handleKeydown"
      />
      <div v-else :class="s.preview" v-html="renderPreview(modelValue)" />

      <div v-if="mentionOpen" :class="s.mentionDropdown">
        <div
          v-for="(user, i) in mentionUsers"
          :key="user.id"
          :class="[s.mentionItem, i === mentionIndex ? s.mentionItemActive : '']"
          @click="selectMention(user)"
        >
          <Avatar :src="user.avatar" :name="user.name" :size="24" />
          <span>{{ user.name }}</span>
          <span style="font-size:12px;color:var(--gray-500)">{{ user.email }}</span>
        </div>
        <div v-if="mentionLoading" :class="s.mentionItem">{{ t('comment.loading') }}</div>
        <div v-if="!mentionUsers.length && !mentionLoading" :class="s.mentionItem">{{ t('comment.noUser') }}</div>
      </div>
    </div>

    <div :class="s.toggleBar">
      <button :class="s.toggleBtn" @click="mode = mode === 'edit' ? 'preview' : 'edit'">
        {{ mode === 'edit' ? t('editor.preview') : t('editor.edit') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onUnmounted } from 'vue';
import { userApi } from '@/api/user.js';
import { renderMarkdown } from '@/utils/markdown.js';
import Avatar from '../Avatar/Avatar.vue';
import s from './MarkdownEditor.module.css';

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '' },
});

const emit = defineEmits(['update:modelValue']);

const { t } = useI18n();

const mode = ref('edit');
const textareaRef = ref(null);

// Mention autocomplete state
const mentionOpen = ref(false);
const mentionQuery = ref('');
const mentionUsers = ref([]);
const mentionLoading = ref(false);
const mentionIndex = ref(0);
let mentionTimer = null;
const timers = [];
let mentionStartPos = -1;

const onInput = (e) => {
  emit('update:modelValue', e.target.value);
  handleMention(e.target.value, e.target.selectionStart);
};

const handleMention = (text, cursorPos) => {
  const beforeCursor = text.slice(0, cursorPos);
  const atIndex = beforeCursor.lastIndexOf('@');

  if (atIndex !== -1 && atIndex === mentionStartPos) {
    const query = beforeCursor.slice(atIndex + 1);
    if (query.includes(' ')) { closeMention(); return; }
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
    } catch { mentionUsers.value = []; }
    mentionLoading.value = false;
  }, 150);
};

const closeMention = () => {
  mentionOpen.value = false;
  mentionUsers.value = [];
  mentionStartPos = -1;
};

const selectMention = (user) => {
  const text = props.modelValue;
  const before = text.slice(0, mentionStartPos);
  const after = text.slice(textareaRef.value.selectionStart);
  emit('update:modelValue', `${before}@${user.name} ${after}`);
  closeMention();
  timers.push(setTimeout(() => textareaRef.value?.focus(), 0));
};

const handleKeydown = (e) => {
  if (!mentionOpen.value) return;
  if (e.key === 'ArrowDown') { e.preventDefault(); mentionIndex.value = (mentionIndex.value + 1) % mentionUsers.value.length; }
  else if (e.key === 'ArrowUp') { e.preventDefault(); mentionIndex.value = (mentionIndex.value - 1 + mentionUsers.value.length) % mentionUsers.value.length; }
  else if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); const user = mentionUsers.value[mentionIndex.value]; if (user) selectMention(user); }
  else if (e.key === 'Escape') { closeMention(); }
};

const wrap = (before, after) => {
  const el = textareaRef.value;
  if (!el) return;
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const text = props.modelValue;
  const selected = text.slice(start, end);
  const newText = text.slice(0, start) + before + selected + after + text.slice(end);
  emit('update:modelValue', newText);
  timers.push(setTimeout(() => {
    el.focus();
    el.setSelectionRange(start + before.length, start + before.length + selected.length);
  }, 0));
};

const prefix = (prefixStr) => {
  const el = textareaRef.value;
  if (!el) return;
  const start = el.selectionStart;
  const text = props.modelValue;
  const lineStart = text.lastIndexOf('\n', start - 1) + 1;
  const newText = text.slice(0, lineStart) + prefixStr + text.slice(lineStart);
  emit('update:modelValue', newText);
  timers.push(setTimeout(() => { el.focus(); el.setSelectionRange(start + prefixStr.length, start + prefixStr.length); }, 0));
};

const renderPreview = renderMarkdown;

onUnmounted(() => {
  timers.forEach(id => clearTimeout(id));
  timers.length = 0;
});
</script>
