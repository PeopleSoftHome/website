<template>
  <div v-if="isOpen" :class="s.overlay" role="dialog" aria-modal="true" :aria-label="t('chatBot.title')">
    <div ref="windowRef" :class="s.window">
      <div :class="s.header">
        <div :class="s.headerLeft">
          <div :class="s.avatar"><Icon name="message-circle" :size="20" color="var(--white)" /></div>
          <div>
            <div :class="s.botName">{{ t('chatBot.botName') }}</div>
            <div :class="s.status">
              <span :class="s.statusDot" />
              {{ isHandoff ? t('chatBot.statusHandoff') : t('chatBot.statusOnline') }}
            </div>
          </div>
        </div>
        <div :class="s.headerActions">
          <button :class="s.handoffBtn" @click="sendMessage(t('chatBot.handoffBtn'))" :title="t('chatBot.handoffBtn')" :aria-label="t('chatBot.handoffBtn')"><Icon name="user" :size="16" /></button>
          <button :class="s.closeBtn" @click="emit('close')" :aria-label="t('chatBot.closeAria')"><Icon name="close" :size="16" /></button>
        </div>
      </div>

      <div :class="s.messages" aria-live="polite" aria-atomic="false">
        <div v-for="msg in messages" :key="msg.id" :class="[s.msgRow, msg.from === 'bot' ? s.botRow : s.userRow]">
          <span v-if="msg.from === 'bot'" :class="s.msgAvatar"><Icon name="message-circle" :size="16" color="var(--white)" /></span>
          <div :class="s.msgGroup">
            <div :class="[s.bubble, msg.from === 'bot' ? s.botBubble : s.userBubble]">
              <span v-html="formatMessage(msg.text)" />
            </div>
            <div :class="s.msgTime">{{ msg.time }}</div>
            <div v-if="msg.from === 'bot' && msg.quickReplies?.length" :class="s.quickReplies">
              <button v-for="q in msg.quickReplies" :key="q" :class="s.quickReply" @click="handleQuickReply(q)">{{ q }}</button>
            </div>
          </div>
        </div>

        <div v-if="isTyping" :class="s.typingRow" aria-hidden="true">
          <span :class="s.typingAvatar"><Icon name="message-circle" :size="16" color="var(--white)" /></span>
          <div :class="s.typingBubble"><span :class="s.dot" /><span :class="s.dot" /><span :class="s.dot" /></div>
        </div>

        <div v-if="isHandoff" :class="s.handoffBar">
          <span><Icon name="user" :size="16" /></span>
          <span>{{ t('chatBot.handoffMsg') }}</span>
          <a href="tel:4008888888" :class="s.handoffCall">{{ t('chatBot.handoffCall') }}</a>
        </div>

        <div ref="bottomRef" />
      </div>

      <div :class="s.inputArea">
        <textarea ref="inputRef" :class="s.input" v-model="input" @keydown="handleKeyDown" :placeholder="t('chatBot.placeholder')" :aria-label="t('chatBot.placeholder')" rows="1" />
        <button :class="[s.sendBtn, input.trim() ? s.sendActive : '']" @click="sendMessage(input)" :aria-label="t('chatBot.sendAria')"><Icon name="send" :size="16" /></button>
      </div>

      <div v-if="messages.length <= 2 && !isTyping" :class="s.quickArea">
        <button v-for="q in quickRepliesDefault" :key="q" :class="s.quickChip" @click="handleQuickReply(q)">{{ q }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { useFocusTrap } from '@/composables/useFocusTrap.js';
import { useChatBot } from '@/composables/useChatBot.js';
import Icon from '../Icon/Icon.vue';
import s from './ChatBot.module.css';

const props = defineProps({ isOpen: { type: Boolean, default: false } });
const emit = defineEmits(['close', 'openDemo']);

const { t, locale } = useI18n();

const windowRef = ref<HTMLElement | null>(null);
const bottomRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLTextAreaElement | null>(null);

useFocusTrap(computed(() => props.isOpen), windowRef);

const {
  messages, input, isTyping, isHandoff, initialized,
  timers, abortController, clearAllTimers,
  welcomeMessages, quickRepliesDefault,
  sendMessage, handleQuickReply, handleKeyDown,
  formatMessage,
} = useChatBot({ emit: emit as (event: string, ...args: unknown[]) => void, locale });

// 初始化欢迎语
watch(() => props.isOpen, (open) => {
  if (!open) {
    clearAllTimers();
    return;
  }
  clearAllTimers();
  if (!initialized.value) {
    initialized.value = true;
    let delay = 300;
    welcomeMessages.value.forEach((msg, i) => {
      const id = window.setTimeout(() => {
        messages.value.push({
          id: Date.now() + i,
          from: 'bot',
          text: msg.text,
          quickReplies: msg.quickReplies,
          time: new Date().toLocaleTimeString(locale.value === 'en' ? 'en-US' : locale.value === 'zh-TW' ? 'zh-TW' : 'zh-CN', { hour: '2-digit', minute: '2-digit' }),
        });
      }, delay);
      timers.value.push(id);
      delay += 800;
    });
  }
  if (open) {
    timers.value.push(window.setTimeout(() => inputRef.value?.focus(), 100));
  }
});

// 消息更新时滚动到底部
watch([messages, isTyping], () => {
  clearAllTimers();
  timers.value.push(window.setTimeout(() => bottomRef.value?.scrollIntoView({ behavior: 'smooth' }), 50));
});

// Escape 关闭
const onEsc = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.isOpen) emit('close');
};
onMounted(() => document.addEventListener('keydown', onEsc));
onUnmounted(() => {
  document.removeEventListener('keydown', onEsc);
  clearAllTimers();
  if (abortController.value) abortController.value.abort();
});
</script>
