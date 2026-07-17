<!--
  Ai Config Assistant 组件

  位于: components/ai/AiConfigAssistant.vue
-->
<template>
  <el-card shadow="hover" class="ai-config-assistant">
    <template #header>
      <div style="display:flex;align-items:center;gap:8px">
        <el-icon><Cpu /></el-icon>
        <span>{{ t('aiConfigAssistant.title') }}</span>
      </div>
    </template>

    <div ref="messageList" class="message-list">
      <div
        v-for="(msg, idx) in messages"
        :key="idx"
        class="message"
        :class="{ 'is-user': msg.role === 'user', 'is-assistant': msg.role === 'assistant' }"
      >
        <div class="message-bubble" v-html="renderMarkdown(msg.content)" />
        <div v-if="msg.imageUrl" class="message-image">
          <img :src="msg.imageUrl" alt="AI generated" />
          <el-button type="primary" size="small" @click="applyImage(msg.imageUrl)">
            {{ t('aiConfigAssistant.applyToHeroBackground') }}
          </el-button>
        </div>
        <div v-if="msg.suggestions?.length" class="message-suggestions">
          <el-button
            v-for="s in msg.suggestions"
            :key="s.field"
            size="small"
            text
            type="primary"
            @click="applyCopy(s)"
          >
            {{ suggestionLabel(s.field) }}
          </el-button>
        </div>
      </div>
      <div v-if="loading" class="message is-assistant">
        <div class="message-bubble">
          <el-icon class="is-loading"><Loading /></el-icon> {{ t('aiConfigAssistant.thinking') }}
        </div>
      </div>
      <div v-if="messages.length === 0 && !loading" class="empty-hint">
        {{ t('aiConfigAssistant.emptyHint') }}
      </div>
    </div>

    <div class="quick-actions">
      <el-button
        v-for="action in quickActions"
        :key="action.key"
        size="small"
        text
        type="primary"
        @click="sendQuick(action)"
      >
        {{ action.label }}
      </el-button>
    </div>

    <div class="input-area">
      <el-input
        v-model="input"
        type="textarea"
        :rows="2"
        :placeholder="t('aiConfigAssistant.inputPlaceholder')"
        @keydown.enter.prevent="sendMessage"
      />
      <el-button type="primary" :loading="loading" :disabled="!input.trim()" @click="sendMessage">
        {{ t('aiConfigAssistant.send') }}
      </el-button>
    </div>
  </el-card>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { Cpu, Loading } from '@element-plus/icons-vue';
import { aiApi } from '@/api/ai';

const { t } = useI18n();

const props = defineProps({
  page: { type: Object, default: null },
  sections: { type: Array, default: () => [] },
});

const emit = defineEmits(['applyImage', 'applyCopy']);

const messages = ref([]);
const input = ref('');
const loading = ref(false);
const messageList = ref(null);

const quickActions = computed(() => [
  { key: 'hero-bg', label: t('aiConfigAssistant.generateHeroBackground'), prompt: t('aiConfigAssistant.generateHeroBackgroundPrompt') },
  { key: 'hero-copy', label: t('aiConfigAssistant.optimizeHeroCopy'), prompt: t('aiConfigAssistant.optimizeHeroCopyPrompt') },
  { key: 'reorder', label: t('aiConfigAssistant.suggestSectionOrder'), prompt: t('aiConfigAssistant.suggestSectionOrderPrompt') },
]);

const context = computed(() => ({
  page: props.page ? { slug: props.page.slug, title: props.page.title } : null,
  sections: props.sections.map((s) => ({ key: s.key, title: s.title, isActive: s.isActive })),
}));

const scrollToBottom = async () => {
  await nextTick();
  if (messageList.value) {
    messageList.value.scrollTop = messageList.value.scrollHeight;
  }
};

watch(messages, scrollToBottom, { deep: true });

const renderMarkdown = (text) => {
  if (!text) return '';
  // 简单渲染：转义 HTML，换行变 <br>，代码块保留
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return escaped.replace(/\n/g, '<br>');
};

const extractImageUrl = (text) => {
  const markdownMatch = text.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/);
  if (markdownMatch) return markdownMatch[1];
  const jsonMatch = text.match(/\{[\s\S]*?"imageUrl"\s*:\s*"(https?:\/\/[^"]+)"[\s\S]*?\}/);
  if (jsonMatch) return jsonMatch[1];
  const urlMatch = text.match(/(https?:\/\/[^\s"]+\.(?:png|jpe?g|gif|webp))/i);
  if (urlMatch) return urlMatch[1];
  return null;
};

const COPY_PATTERNS = [
  { field: 'title', regex: /(?:主标题|主標題|Title)[:：]\s*(.+)/i },
  { field: 'subtitle', regex: /(?:副标题|副標題|Subtitle)[:：]\s*(.+)/i },
  { field: 'ctaPrimary', regex: /(?:主按钮文案|主按鈕文案|Primary CTA|CTA Primary|主按钮|主按鈕)[:：]\s*(.+)/i },
  { field: 'ctaSecondary', regex: /(?:次按钮文案|次按鈕文案|Secondary CTA|CTA Secondary|次按钮|次按鈕)[:：]\s*(.+)/i },
];

const extractCopySuggestions = (text) => {
  const suggestions = [];
  for (const { field, regex } of COPY_PATTERNS) {
    const match = text.match(regex);
    if (match && match[1].trim()) {
      suggestions.push({ field, value: match[1].trim() });
    }
  }
  return suggestions;
};

const suggestionLabel = (field) => {
  const key = `aiConfigAssistant.applyTo${field.charAt(0).toUpperCase() + field.slice(1)}`;
  return t(key);
};

const applyCopy = (suggestion) => {
  emit('applyCopy', suggestion);
};

const sendQuick = (action) => {
  input.value = action.prompt;
  sendMessage();
};

const sendMessage = async () => {
  const text = input.value.trim();
  if (!text || loading.value) return;

  messages.value.push({ role: 'user', content: text });
  input.value = '';
  loading.value = true;

  try {
    const history = messages.value.slice(0, -1).map((m) => ({ role: m.role, content: m.content }));
    const res = await aiApi.adminChat({ message: text, history, context: context.value });
    const result = res || '';
    const content = typeof result === 'string' ? result : (result.content || result.message || JSON.stringify(result));
    const imageUrl = extractImageUrl(content);
    const suggestions = extractCopySuggestions(content);
    messages.value.push({ role: 'assistant', content, imageUrl, suggestions });
  } catch (e) {
    ElMessage.error(e.message || t('aiConfigAssistant.sendFailed'));
    messages.value.push({ role: 'assistant', content: t('aiConfigAssistant.sendFailed') });
  } finally {
    loading.value = false;
  }
};

const applyImage = (url) => {
  emit('applyImage', url);
};

defineExpose({ messages, sendMessage });
</script>

<style scoped>
.ai-config-assistant {
  display: flex;
  flex-direction: column;
}

.message-list {
  max-height: 360px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 12px;
}

.message {
  display: flex;
  flex-direction: column;
}

.message.is-user {
  align-items: flex-end;
}

.message.is-assistant {
  align-items: flex-start;
}

.message-bubble {
  max-width: 90%;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.6;
  word-break: break-word;
}

.message.is-user .message-bubble {
  background: var(--admin-color-primary-light-1);
  color: var(--admin-color-primary);
}

.message.is-assistant .message-bubble {
  background: var(--admin-bg-base);
  color: var(--admin-text-regular);
}

.message-image {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.message-image img {
  max-width: 100%;
  border-radius: 6px;
}

.message-suggestions {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.empty-hint {
  color: var(--admin-text-secondary);
  font-size: 13px;
  text-align: center;
  padding: 24px 0;
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.input-area {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.input-area .el-textarea {
  flex: 1;
}
</style>
