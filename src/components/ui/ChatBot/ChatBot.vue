<template>
  <div v-if="isOpen" :class="s.overlay" role="dialog" aria-modal="true" :aria-label="t('chatBot.title')">
    <div ref="windowRef" :class="s.window">
      <!-- 顶部标题栏 -->
      <div :class="s.header">
        <div :class="s.headerLeft">
          <div :class="s.avatar">
            <Icon name="message-circle" :size="20" color="#fff" />
          </div>
          <div>
            <div :class="s.botName">{{ t('chatBot.botName') }}</div>
            <div :class="s.status">
              <span :class="s.statusDot" />
              {{ isHandoff ? t('chatBot.statusHandoff') : t('chatBot.statusOnline') }}
            </div>
          </div>
        </div>
        <div :class="s.headerActions">
          <button :class="s.handoffBtn" @click="sendMessage(t('chatBot.handoffBtn'))" :title="t('chatBot.handoffBtn')" :aria-label="t('chatBot.handoffBtn')">
            <Icon name="user" :size="16" />
          </button>
          <button :class="s.closeBtn" @click="emit('close')" :aria-label="t('chatBot.closeAria')">
            <Icon name="close" :size="16" />
          </button>
        </div>
      </div>

      <!-- 消息列表 -->
      <div :class="s.messages" aria-live="polite" aria-atomic="false">
        <div
          v-for="msg in messages"
          :key="msg.id"
          :class="[s.msgRow, msg.from === 'bot' ? s.botRow : s.userRow]"
        >
          <span v-if="msg.from === 'bot'" :class="s.msgAvatar">
            <Icon name="message-circle" :size="16" color="#fff" />
          </span>
          <div :class="s.msgGroup">
            <div :class="[s.bubble, msg.from === 'bot' ? s.botBubble : s.userBubble]">
              <span v-html="formatMessage(msg.text)" />
            </div>
            <div :class="s.msgTime">{{ msg.time }}</div>
            <div v-if="msg.from === 'bot' && msg.quickReplies?.length" :class="s.quickReplies">
              <button v-for="q in msg.quickReplies" :key="q" :class="s.quickReply" @click="handleQuickReply(q)">
                {{ q }}
              </button>
            </div>
          </div>
        </div>

        <!-- 打字指示器 -->
        <div v-if="isTyping" :class="s.typingRow" aria-hidden="true">
          <span :class="s.typingAvatar">
            <Icon name="message-circle" :size="16" color="#fff" />
          </span>
          <div :class="s.typingBubble">
            <span :class="s.dot" />
            <span :class="s.dot" />
            <span :class="s.dot" />
          </div>
        </div>

        <!-- 人工接入提示条 -->
        <div v-if="isHandoff" :class="s.handoffBar">
          <span><Icon name="user" :size="16" /></span>
          <span>{{ t('chatBot.handoffMsg') }}</span>
          <a href="tel:4008888888" :class="s.handoffCall">{{ t('chatBot.handoffCall') }}</a>
        </div>

        <div ref="bottomRef" />
      </div>

      <!-- 输入区 -->
      <div :class="s.inputArea">
        <textarea
          ref="inputRef"
          :class="s.input"
          v-model="input"
          @keydown="handleKeyDown"
          :placeholder="t('chatBot.placeholder')"
          :aria-label="t('chatBot.placeholder')"
          rows="1"
        />
        <button :class="[s.sendBtn, input.trim() ? s.sendActive : '']" @click="sendMessage(input)" :aria-label="t('chatBot.sendAria')">
          <Icon name="send" :size="16" />
        </button>
      </div>

      <!-- 底部快捷入口 -->
      <div v-if="messages.length <= 2 && !isTyping" :class="s.quickArea">
        <button v-for="q in quickRepliesDefault" :key="q" :class="s.quickChip" @click="handleQuickReply(q)">
          {{ q }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject, watch, onMounted, onUnmounted } from 'vue';
import { useFocusTrap } from '@/composables/useFocusTrap.js';
import { aiApi } from '@/api/ai.js';
import { BOT_AVATAR, FAQ_RULES_META, FALLBACK_REPLY_KEYS } from './chatData.js';
import Icon from '../Icon/Icon.vue';
import s from './ChatBot.module.css';

const props = defineProps({ isOpen: { type: Boolean, default: false } });
const emit = defineEmits(['close', 'openDemo']);

const { t, locale } = inject('i18n', { t: (k) => k, locale: ref('zh') });

const messages = ref([]);
const input = ref('');
const isTyping = ref(false);
const isHandoff = ref(false);
const initialized = ref(false);
const windowRef = ref(null);
const bottomRef = ref(null);
const inputRef = ref(null);
const timers = ref([]);
const abortController = ref(null);

useFocusTrap(() => props.isOpen, windowRef);

const faqRules = computed(() => FAQ_RULES_META.map(meta => ({
  ...meta,
  reply: t(`chatBot.faq.${meta.id}.reply`),
  quickReplies: t(`chatBot.faq.${meta.id}.quickReplies`) || [],
})));

const fallbackReplies = computed(() => FALLBACK_REPLY_KEYS.map(k => t(`chatBot.${k}`)).filter(Boolean));
const welcomeMessages = computed(() => [
  { text: t('chatBot.welcome1'), quickReplies: [] },
  { text: t('chatBot.welcome2'), quickReplies: t('chatBot.welcomeQuickReplies') || [] },
]);
const quickRepliesDefault = computed(() => t('chatBot.quickRepliesDefault') || []);

const clearAllTimers = () => {
  timers.value.forEach(id => clearTimeout(id));
  timers.value = [];
};

const nowTime = () => {
  const loc = locale.value === 'en' ? 'en-US' : locale.value === 'zh-TW' ? 'zh-TW' : 'zh-CN';
  return new Date().toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit' });
};

const matchRule = (text) => {
  const lower = text.toLowerCase();
  for (const rule of faqRules.value) {
    if (rule.keywords.some(kw => lower.includes(kw.toLowerCase()))) {
      return rule;
    }
  }
  return {
    reply: fallbackReplies.value[Math.floor(Math.random() * fallbackReplies.value.length)] || '',
    quickReplies: [],
  };
};

// 本地快捷操作检测（无需调用 API）
const LOCAL_ACTIONS = {
  demo: ['演示', '预约', 'demo', 'book', 'trial', '试用', '体验'],
  human: ['人工', '客服', 'agent', 'human', 'service', '真人', '转人工'],
};

const detectLocalAction = (text) => {
  const lower = text.toLowerCase();
  if (LOCAL_ACTIONS.demo.some(k => lower.includes(k))) return 'demo';
  if (LOCAL_ACTIONS.human.some(k => lower.includes(k))) return 'human';
  return null;
};

const pushBotMessage = (text, quickReplies = []) => {
  messages.value.push({
    id: Date.now(),
    from: 'bot',
    text,
    quickReplies,
    time: nowTime(),
  });
};

const sendMessage = async (text) => {
  const trimmed = text.trim();
  if (!trimmed) return;

  if (abortController.value) {
    abortController.value.abort();
  }

  messages.value.push({
    id: Date.now(),
    from: 'user',
    text: trimmed,
    time: nowTime(),
  });
  input.value = '';
  isTyping.value = true;

  // 本地快捷操作（演示 / 人工）直接前端处理
  const action = detectLocalAction(trimmed);
  if (action === 'demo') {
    isTyping.value = false;
    emit('openDemo');
    pushBotMessage(t('chatBot.faq.demo.reply'), t('chatBot.faq.demo.quickReplies') || []);
    return;
  }
  if (action === 'human') {
    isTyping.value = false;
    isHandoff.value = true;
    pushBotMessage(t('chatBot.faq.human.reply'), t('chatBot.faq.human.quickReplies') || []);
    return;
  }

  // 构建对话历史（最近 3 轮，不含当前消息）
  const history = messages.value
    .slice(0, -1)
    .filter(m => m.from === 'user' || m.from === 'bot')
    .slice(-6)
    .map(m => ({
      role: m.from === 'user' ? 'user' : 'assistant',
      content: m.text,
    }));

  abortController.value = new AbortController();

  try {
    // 使用 SSE 流式输出
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
    const url = `${baseUrl}/ai/chat-stream?message=${encodeURIComponent(trimmed)}`;
    const es = new EventSource(url);
    let replyText = '';
    const botMsgId = Date.now() + '_stream';

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.chunk) {
          replyText += data.chunk;
          // 更新或追加消息
          const existing = messages.value.find(m => m.id === botMsgId);
          if (existing) {
            existing.text = replyText;
          } else {
            messages.value.push({ id: botMsgId, from: 'bot', text: replyText, time: nowTime() });
          }
          scrollToBottom();
        }
        if (data.done) {
          es.close();
          isTyping.value = false;
          abortController.value = null;
        }
      } catch {
        // ignore parse error
      }
    };

    es.onerror = () => {
      es.close();
      isTyping.value = false;
      abortController.value = null;
      if (!replyText) {
        const matched = matchRule(trimmed);
        pushBotMessage(matched.reply || t('chatBot.fallback1'), matched.quickReplies || []);
      }
    };

    abortController.value = { abort: () => es.close() };
  } catch (err) {
    if (import.meta.env.DEV) console.error('[ChatBot] API error:', err);
    const matched = matchRule(trimmed);
    isTyping.value = false;
    pushBotMessage(matched.reply || t('chatBot.fallback1'), matched.quickReplies || []);
    abortController.value = null;
  }
};

const handleQuickReply = (text) => {
  const lower = text.toLowerCase();
  if (lower.includes('演示') || lower.includes('demo') || lower.includes('预约') || lower.includes('book')) {
    emit('openDemo');
    sendMessage(text);
    return;
  }
  if (lower.includes('人工') || lower.includes('agent') || lower.includes('human') || lower.includes('客服') || lower.includes('service')) {
    sendMessage(t('chatBot.handoffBtn'));
    return;
  }
  sendMessage(text);
};

const handleKeyDown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage(input.value);
  }
};

// 初始化欢迎语
watch(() => props.isOpen, (open) => {
  if (open && !initialized.value) {
    initialized.value = true;
    let delay = 300;
    welcomeMessages.value.forEach((msg, i) => {
      const id = setTimeout(() => {
        messages.value.push({
          id: Date.now() + i,
          from: 'bot',
          text: msg.text,
          quickReplies: msg.quickReplies,
          time: nowTime(),
        });
      }, delay);
      timers.value.push(id);
      delay += 800;
    });
  }
  if (open) {
    const id = setTimeout(() => inputRef.value?.focus(), 100);
    timers.value.push(id);
  }
});

// 消息更新时滚动到底部
watch([messages, isTyping], () => {
  setTimeout(() => bottomRef.value?.scrollIntoView({ behavior: 'smooth' }), 50);
});

// Escape 关闭
const onEsc = (e) => {
  if (e.key === 'Escape' && props.isOpen) emit('close');
};
onMounted(() => document.addEventListener('keydown', onEsc));
onUnmounted(() => {
  document.removeEventListener('keydown', onEsc);
  clearAllTimers();
  if (abortController.value) abortController.value.abort();
});

// 格式化消息文本（**bold** → <strong>, \n → <br>）
const escapeHtml = (text) => {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const formatMessage = (text) => {
  if (!text) return '';
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .map((part) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return `<strong>${escapeHtml(part.slice(2, -2))}</strong>`;
      }
      return escapeHtml(part).replace(/\n/g, '<br>');
    })
    .join('');
};
</script>
