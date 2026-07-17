import { ref, computed, onMounted, type Ref } from 'vue';
import { apiClient } from '@/shared/api/client';
import { usePublicConfig } from '@/composables/usePublicConfig';
import { FAQ_RULES_META, FALLBACK_REPLY_KEYS } from '@/components/ui/ChatBot/chatData';
import { formatMessage, nowTime } from '@/components/ui/ChatBot/chatUtils';
import { detectLocalAction, matchIntent as matchIntentRule, isDemoQuickReply, isHumanQuickReply, type ChatIntent } from '@/components/ui/ChatBot/chatIntents';
import { STORAGE_KEYS } from '@/constants/storage';
import { ENDPOINTS } from '@/constants/endpoints';
import { getOrCreateSessionId } from '@/composables/useSessionId';

const STORAGE_KEY = STORAGE_KEYS.CHAT_SESSION_ID;

interface ChatAction {
  type: 'open_demo' | 'open_contact' | 'link';
  label: string;
  url?: string;
}

interface ChatMessage {
  id: number;
  from: 'user' | 'bot';
  text: string;
  quickReplies?: string[];
  actions?: ChatAction[];
  time?: string;
}

interface ChatBotConfig {
  intents: ChatIntent[];
  quickReplies: string[];
  fallbackCopy: string;
}

interface UseChatBotOptions {
  emit: (event: string, ...args: unknown[]) => void;
  locale: Ref<string>;
}

function getSessionId(): string {
  return getOrCreateSessionId(STORAGE_KEY, 'sessionStorage');
}

export function useChatBot({ emit, locale }: UseChatBotOptions) {
  const { recaptchaSiteKey } = usePublicConfig();

  const messages = ref<ChatMessage[]>([]);
  const input = ref('');
  const isTyping = ref(false);
  const isHandoff = ref(false);
  const initialized = ref(false);
  const timers = ref<number[]>([]);
  const abortController = ref<AbortController | null>(null);
  const sessionId = ref(getSessionId());
  const botConfig = ref<ChatBotConfig>({
    intents: [],
    quickReplies: [],
    fallbackCopy: '',
  });

  const { t } = useI18n();

  onMounted(async () => {
    try {
      const res = await apiClient.get('/system/chatbot-config', { silent: true });
      const data = (res?.data || res || {}) as Partial<ChatBotConfig>;
      botConfig.value = {
        intents: Array.isArray(data.intents) ? (data.intents as ChatIntent[]) : [],
        quickReplies: Array.isArray(data.quickReplies) ? (data.quickReplies as string[]) : [],
        fallbackCopy: data.fallbackCopy || '',
      };
    } catch {
      // 后端未配置时使用本地静态 fallback
    }
  });

  const faqRules = computed(() => FAQ_RULES_META.map(meta => ({
    ...meta,
    reply: t(`chatBot.faq.${meta.id}.reply`),
    quickReplies: (t(`chatBot.faq.${meta.id}.quickReplies`) as unknown as string[]) || [],
  })));

  const fallbackReplies = computed(() => FALLBACK_REPLY_KEYS.map(k => t(`chatBot.${k}`)).filter(Boolean));
  const welcomeMessages = computed(() => [
    { text: t('chatBot.welcome1'), quickReplies: [] as string[] },
    { text: t('chatBot.welcome2'), quickReplies: (t('chatBot.welcomeQuickReplies') as unknown as string[]) || [] },
  ]);
  const quickRepliesDefault = computed(() => {
    const cms = botConfig.value.quickReplies || [];
    return cms.length ? cms : (t('chatBot.quickRepliesDefault') as unknown as string[]) || [];
  });

  const clearAllTimers = () => {
    timers.value.forEach(id => clearTimeout(id));
    timers.value = [];
  };

  const matchIntent = (text: string) => matchIntentRule(text, botConfig.value.intents);

  const matchRule = (text: string) => {
    const lower = text.toLowerCase();
    for (const rule of faqRules.value) {
      if (rule.keywords.some(kw => lower.includes(kw.toLowerCase()))) {
        return rule;
      }
    }
    return {
      reply: fallbackReplies.value[Math.floor(Math.random() * fallbackReplies.value.length)] || '',
      quickReplies: [] as string[],
    };
  };

  const pushBotMessage = (text: string, quickReplies: string[] = [], actions: ChatAction[] = []) => {
    messages.value.push({
      id: Date.now(),
      from: 'bot',
      text,
      quickReplies,
      actions,
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

  const sendMessage = async (text: string) => {
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
      pushBotMessage(t('chatBot.faq.demo.reply'), (t('chatBot.faq.demo.quickReplies') as unknown as string[]) || []);
      return;
    }
    if (action === 'human') {
      isTyping.value = false;
      isHandoff.value = true;
      pushBotMessage(t('chatBot.faq.human.reply'), (t('chatBot.faq.human.quickReplies') as unknown as string[]) || []);
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

      const result = (await apiClient.post(
        ENDPOINTS.AI_CHAT,
        {
          message: trimmed,
          history: buildHistory(),
          recaptchaToken,
          sessionId: sessionId.value,
          locale: locale.value,
        },
        { signal: abortController.value.signal },
      )).data as { content?: string; sessionId?: string; actions?: ChatAction[] };

      const replyText = result?.content || '';
      if (result?.sessionId && result.sessionId !== sessionId.value) {
        sessionId.value = result.sessionId;
      }
      isTyping.value = false;
      abortController.value = null;

      if (replyText) {
        pushBotMessage(replyText, [], result.actions || []);
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

  const handleQuickReply = (text: string) => {
    if (isDemoQuickReply(text)) {
      emit('openDemo');
      sendMessage(text);
      return;
    }
    if (isHumanQuickReply(text)) {
      sendMessage(t('chatBot.handoffBtn'));
      return;
    }
    sendMessage(text);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
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
