import { ref, computed, onMounted } from 'vue';
import { apiClient } from '@/api/client.js';
import { usePublicConfig } from '@/composables/usePublicConfig.js';
import { FAQ_RULES_META, FALLBACK_REPLY_KEYS } from '@/components/ui/ChatBot/chatData.js';
import { formatMessage, nowTime } from '@/components/ui/ChatBot/chatUtils.js';

const LOCAL_ACTIONS = {
  demo: ['演示', '预约', 'demo', 'book', 'trial', '试用', '体验'],
  human: ['人工', '客服', 'agent', 'human', 'service', '真人', '转人工'],
};

const STORAGE_KEY = 'tp-chat-session-id';

function getSessionId() {
  if (typeof window === 'undefined') return '';
  let id = sessionStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

export function useChatBot({ emit, locale }) {
  const { recaptchaSiteKey } = usePublicConfig();

  const messages = ref([]);
  const input = ref('');
  const isTyping = ref(false);
  const isHandoff = ref(false);
  const initialized = ref(false);
  const timers = ref([]);
  const abortController = ref(null);
  const sessionId = ref(getSessionId());
  const botConfig = ref({
    intents: [],
    quickReplies: [],
    fallbackCopy: '',
  });

  const { t } = useI18n();

  onMounted(async () => {
    try {
      const res = await apiClient.get('/system/chatbot-config', { silent: true });
      const data = res?.data || res || {};
      botConfig.value = {
        intents: Array.isArray(data.intents) ? data.intents : [],
        quickReplies: Array.isArray(data.quickReplies) ? data.quickReplies : [],
        fallbackCopy: data.fallbackCopy || '',
      };
    } catch {
      // 后端未配置时使用本地静态 fallback
    }
  });

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
  const quickRepliesDefault = computed(() => {
    const cms = botConfig.value.quickReplies || [];
    return cms.length ? cms : (t('chatBot.quickRepliesDefault') || []);
  });

  const clearAllTimers = () => {
    timers.value.forEach(id => clearTimeout(id));
    timers.value = [];
  };

  const matchIntent = (text) => {
    const lower = text.toLowerCase();
    for (const intent of botConfig.value.intents) {
      if (Array.isArray(intent.keywords) && intent.keywords.some(k => lower.includes(k.toLowerCase()))) {
        return intent;
      }
    }
    return null;
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

  const buildHistory = () => messages.value
    .filter(m => m.from === 'user' || m.from === 'bot')
    .slice(-10)
    .map(m => ({
      role: m.from === 'user' ? 'user' : 'assistant',
      content: m.text,
    }));

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

    const intent = matchIntent(trimmed);
    if (intent?.reply) {
      isTyping.value = false;
      pushBotMessage(intent.reply, intent.quickReplies || []);
      return;
    }

    abortController.value = new AbortController();

    try {
      let recaptchaToken = '';
      if (recaptchaSiteKey && typeof window !== 'undefined' && window.grecaptcha) {
        try {
          recaptchaToken = await window.grecaptcha.execute(recaptchaSiteKey, { action: 'chatbot' });
        } catch {
          // reCAPTCHA 未加载或失败，继续提交
        }
      }

      const result = await apiClient.post(
        '/ai/chat',
        {
          message: trimmed,
          history: buildHistory(),
          recaptchaToken,
          sessionId: sessionId.value,
        },
        { signal: abortController.value.signal },
      );

      const replyText = result?.content || '';
      if (result?.sessionId && result.sessionId !== sessionId.value) {
        sessionId.value = result.sessionId;
      }
      isTyping.value = false;
      abortController.value = null;

      if (replyText) {
        pushBotMessage(replyText, []);
      } else {
        const matched = matchRule(trimmed);
        pushBotMessage(matched.reply || botConfig.value.fallbackCopy || t('chatBot.fallback1'), matched.quickReplies || []);
      }
    } catch (err) {
      if (import.meta.env.DEV) console.error('[ChatBot] API error:', err);
      isTyping.value = false;
      abortController.value = null;
      const matched = matchRule(trimmed);
      pushBotMessage(matched.reply || botConfig.value.fallbackCopy || t('chatBot.fallback1'), matched.quickReplies || []);
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
