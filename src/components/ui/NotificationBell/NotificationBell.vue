<template>
  <div style="position:relative">
    <button :class="s.bellWrap" @click="open = !open" :aria-label="t('notification.title')">
      <Icon name="bell" :size="18" />
      <span v-if="unreadCount > 0" :class="s.badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
    </button>

    <div v-if="open" :class="s.dropdown">
      <div :class="s.dropdownHeader">
        <span :class="s.dropdownTitle">{{ t('notification.title') }}</span>
        <button v-if="unreadCount > 0" :class="s.readAllBtn" @click="markAllRead">
          {{ t('notification.readAll') }}
        </button>
      </div>
      <div :class="s.list">
        <div
          v-for="n in notifications"
          :key="n.id"
          :class="[s.item, n.isRead ? '' : s.itemUnread]"
          @click="handleClick(n)"
        >
          <div :class="[s.itemDot, n.isRead ? s.itemDotRead : '']" />
          <div :class="s.itemBody">
            <div :class="s.itemTitle">{{ n.title }}</div>
            <div :class="s.itemContent">{{ n.content }}</div>
            <div :class="s.itemTime">{{ formatTime(n.createdAt) }}</div>
          </div>
        </div>
        <div v-if="!notifications.length" :class="s.empty">{{ t('notification.empty') }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, onUnmounted } from 'vue';
import { notificationApi } from '@/api/notification.js';
import Icon from '../Icon/Icon.vue';
import s from './NotificationBell.module.css';

const { t } = inject('i18n', { t: (k) => k });
const auth = inject('auth', { user: { value: null }, token: { value: '' } });

const open = ref(false);
const notifications = ref([]);
const unreadCount = ref(0);
let es = null;

const fetchNotifications = async () => {
  try {
    const res = await notificationApi.getNotifications(1, 20);
    const result = res.data || res;
    notifications.value = result.data || [];
    unreadCount.value = result.meta?.unreadCount || 0;
  } catch (e) {
    console.error(e);
  }
};

const markAllRead = async () => {
  try {
    await notificationApi.markAllAsRead();
    notifications.value.forEach((n) => (n.isRead = true));
    unreadCount.value = 0;
  } catch (e) {
    console.error(e);
  }
};

const handleClick = async (n) => {
  if (!n.isRead) {
    try {
      await notificationApi.markAsRead(n.id);
      n.isRead = true;
      unreadCount.value = Math.max(0, unreadCount.value - 1);
    } catch (e) {
      console.error(e);
    }
  }
  open.value = false;
};

const formatTime = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const connectSSE = () => {
  if (!auth.token.value) return;
  try {
    es = notificationApi.createEventSource(auth.token.value);
    es.onmessage = (event) => {
      try {
        const notif = JSON.parse(event.data);
        notifications.value.unshift(notif);
        unreadCount.value++;
      } catch {
        // ignore
      }
    };
    es.onerror = () => {
      es.close();
      setTimeout(connectSSE, 5000);
    };
  } catch (e) {
    console.error(e);
  }
};

onMounted(() => {
  fetchNotifications();
  connectSSE();
});

onUnmounted(() => {
  if (es) es.close();
});
</script>
