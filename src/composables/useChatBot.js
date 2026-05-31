import { ref, computed, inject } from 'vue';
import { FAQ_RULES_META, FALLBACK_REPLY_KEYS } from '@/components/ui/ChatBot/chatData.js';
import { formatMessage, nowTime } from '@/components/ui/ChatBot/chatUtils.js';

const LOCAL_ACTIONS = {
  demo: ['演示', '预约', 'demo', 'book', 'trial', '试用', '体验'],
  human: ['人工', '客服', 'agent', 'human', 'service', '真人', '转人工'],
};

export function useChatBot({ emit, locale }) {
  const messages = ref([]);
  const input = ref('');
  const isTyping = ref(false);
  const isHandoff = ref(false);
  const initialized = ref(false);
  const timers = ref([]);
  const abortController = ref(null);

  const { t } = useI18n();

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
      time: nowTime(locale.value),
    });
  };

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (abortController.value) abortController.value.abort();

    messages.value.push({
      id: Date.now(),
      from: 'user',
      text: trimmed,
      time: nowTime(locale.value),
    });
    input.value = '';
    isTyping.value = true;

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

    abortController.value = new AbortController();

    try {
      const url = `${API_BASE_URL}/ai/chat-stream?message=${encodeURIComponent(trimmed)}`;
      const es = new EventSource(url);
      let replyText = '';
      const botMsgId = Date.now() + '_stream';

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.chunk) {
            replyText += data.chunk;
            const existing = messages.value.find(m => m.id === botMsgId);
            if (existing) {
              existing.text = replyText;
            } else {
              messages.value.push({ id: botMsgId, from: 'bot', text: replyText, time: nowTime(locale.value) });
            }
          }
          if (data.done) {
            es.close();
            isTyping.value = false;
            abortController.value = null;
          }
        } catch { /* ignore parse error */ }
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

  return {
    messages, input, isTyping, isHandoff, initialized,
    timers, abortController, clearAllTimers,
    welcomeMessages, quickRepliesDefault,
    sendMessage, handleQuickReply, handleKeyDown,
    formatMessage,
  };
}
