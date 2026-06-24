<template>
  <el-popover
    v-model:visible="popoverVisible"
    placement="bottom-end"
    :width="360"
    trigger="click"
    popper-class="notification-popover"
  >
    <template #reference>
      <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="notification-badge">
        <el-icon :size="20" class="bell-icon">
          <Bell />
        </el-icon>
      </el-badge>
    </template>

    <div class="notification-header">
      <span class="notification-title">通知中心</span>
      <el-button v-if="unreadCount > 0" link type="primary" size="small" @click="markAllRead">
        全部已读
      </el-button>
    </div>

    <el-divider style="margin: 8px 0" />

    <div v-if="notifications.length === 0" class="notification-empty">
      <el-empty description="暂无通知" :image-size="60" />
    </div>

    <div v-else class="notification-list">
      <div
        v-for="item in notifications"
        :key="item.id"
        :class="['notification-item', { unread: !item.isRead }]"
        @click="markRead(item)"
      >
        <div class="notification-item-header">
          <el-tag :type="item.type || 'info'" size="small">{{ typeLabel(item.type) }}</el-tag>
          <span class="notification-time">{{ formatTime(item.createdAt) }}</span>
        </div>
        <div class="notification-item-title">{{ item.title }}</div>
        <div class="notification-item-message">{{ item.message }}</div>
      </div>
    </div>
  </el-popover>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { Bell } from '@element-plus/icons-vue';
import { ElNotification } from 'element-plus';
import client from '@/api/client.js';
import { useAuthStore } from '@/stores/auth.js';

const auth = useAuthStore();
const notifications = ref([]);
const popoverVisible = ref(false);
let eventSource = null;

const unreadCount = computed(() => notifications.value.filter((n) => !n.isRead).length);

const typeLabel = (type) => {
  const map = { info: '信息', success: '成功', warning: '警告', error: '错误' };
  return map[type] || '信息';
};

const formatTime = (d) => {
  if (!d) return '';
  const date = new Date(d);
  const now = new Date();
  const diff = now - date;
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  return date.toLocaleDateString('zh-CN');
};

const fetchNotifications = async () => {
  try {
    const res = await client.get('/notifications?pageSize=10');
    notifications.value = res.data || [];
  } catch (e) {
    if (import.meta.env.DEV) {
      console.error('获取通知失败', e);
    }
  }
};

const markRead = async (item) => {
  if (item.isRead) return;
  try {
    await client.patch(`/notifications/${item.id}/read`);
    item.isRead = true;
  } catch (e) {
    if (import.meta.env.DEV) {
      console.error('标记已读失败', e);
    }
  }
};

const markAllRead = async () => {
  try {
    await client.patch('/notifications/read-all');
    notifications.value.forEach((n) => { n.isRead = true; });
  } catch (e) {
    if (import.meta.env.DEV) {
      console.error('全部已读失败', e);
    }
  }
};

const handleNewNotification = (payload) => {
  const item = payload.data || payload;
  notifications.value.unshift(item);
  if (notifications.value.length > 10) {
    notifications.value = notifications.value.slice(0, 10);
  }
  ElNotification({
    title: item.title,
    message: item.message,
    type: item.type || 'info',
    duration: 5000,
  });
};

let sseRetryCount = 0;
const MAX_SSE_RETRIES = 5;
let sseHasOpened = false;
let reconnectTimer = null;

const connectSSE = () => {
  if (!auth.token) return;
  if (eventSource) {
    eventSource.close();
  }
  if (sseRetryCount >= MAX_SSE_RETRIES) {
    if (import.meta.env.DEV) {
      console.warn('SSE 重连次数已达上限，停止重试');
    }
    return;
  }
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';
  const url = `${baseURL}/notifications/stream?token=${encodeURIComponent(auth.token)}`;
  sseHasOpened = false;
  eventSource = new EventSource(url);

  eventSource.addEventListener('open', () => {
    sseRetryCount = 0;
    sseHasOpened = true;
  });

  eventSource.addEventListener('message', (event) => {
    try {
      const data = JSON.parse(event.data);
      handleNewNotification(data);
    } catch (e) {
      if (import.meta.env.DEV) {
        console.error('SSE 消息解析失败', e);
      }
    }
  });

  eventSource.addEventListener('error', () => {
    eventSource.close();
    // 如果从未成功连接过，很可能是 401 token 无效，不再重试
    if (!sseHasOpened && sseRetryCount >= 1) {
      if (import.meta.env.DEV) {
        console.warn('SSE 认证失败，停止重试');
      }
      return;
    }
    sseRetryCount += 1;
    if (sseRetryCount >= MAX_SSE_RETRIES) {
      if (import.meta.env.DEV) {
        console.warn('SSE 重连次数已达上限，停止重试');
      }
      return;
    }
    const delay = Math.min(3000 * Math.pow(2, sseRetryCount - 1), 30000);
    if (import.meta.env.DEV) {
      console.warn(`SSE 连接错误，${delay / 1000}秒后第${sseRetryCount}次重连`);
    }
    reconnectTimer = setTimeout(connectSSE, delay);
  });
};

onMounted(() => {
  fetchNotifications();
  connectSSE();
});

onUnmounted(() => {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
});
</script>

<style scoped>
.notification-badge {
  cursor: pointer;
  line-height: 1;
}
.bell-icon {
  color: var(--admin-text-regular);
  transition: color 0.2s;
}
.bell-icon:hover {
  color: var(--admin-color-primary);
}
.notification-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
}
.notification-title {
  font-weight: 600;
  font-size: 15px;
  color: var(--admin-text-primary);
}
.notification-empty {
  padding: 8px 0;
}
.notification-list {
  max-height: 320px;
  overflow-y: auto;
}
.notification-item {
  padding: 10px 12px;
  border-bottom: 1px solid var(--admin-border-lighter);
  cursor: pointer;
  transition: background 0.2s;
}
.notification-item:last-child {
  border-bottom: none;
}
.notification-item:hover {
  background: var(--admin-bg-base);
}
.notification-item.unread {
  background: var(--admin-color-primary-light-1);
}
.notification-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}
.notification-time {
  font-size: 12px;
  color: var(--admin-text-secondary);
}
.notification-item-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--admin-text-primary);
  margin-bottom: 2px;
}
.notification-item-message {
  font-size: 13px;
  color: var(--admin-text-regular);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
