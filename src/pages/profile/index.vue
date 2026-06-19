<template>
  <div>
    <div v-if="user" :class="s.dashboard" class="reveal">
      <!-- Stats -->
      <div :class="s.stats">
        <div v-for="(st, i) in stats" :key="i" :class="s.statCard">
          <div :class="s.statIcon">{{ st.icon }}</div>
          <div :class="s.statValue">{{ st.value }}</div>
          <div :class="s.statLabel">{{ st.label }}</div>
        </div>
      </div>

      <!-- Profile + Activity -->
      <div :class="s.twoCol">
        <div :class="s.profileCard">
          <div :class="s.profileHeader">
            <Avatar :src="user.avatar" :name="user.name" :size="64" />
            <div :class="s.profileInfo">
              <h2 :class="s.profileName">{{ user.name || user.email }}</h2>
              <p :class="s.profileEmail">{{ user.email }}</p>
              <p v-if="user.workspaceName" :class="s.profileWorkspace">{{ user.workspaceName }} · {{ user.workspaceRole }}</p>
            </div>
          </div>
          <p v-if="user.bio" :class="s.profileBio">{{ user.bio }}</p>
          <div :class="s.profileMeta">{{ t('profile.joined') }} {{ formatDate(user.createdAt) }}</div>
          <NuxtLink to="/profile/settings" :class="s.editLink">{{ t('profile.edit') }} →</NuxtLink>
        </div>

        <div :class="s.activityCard">
          <h3 :class="s.cardTitle">{{ t('profile.activity') }}</h3>
          <div :class="s.activityList">
            <div v-for="(act, i) in activities" :key="i" :class="s.activityItem">
              <div :class="s.activityDot" />
              <div>
                <div :class="s.activityText">{{ act.text }}</div>
                <div :class="s.activityDate">{{ act.date }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick actions -->
      <div :class="s.quick" class="reveal">
        <h3 :class="s.cardTitle">{{ t('profile.quick') }}</h3>
        <div :class="s.quickGrid">
          <NuxtLink to="/marketplace" :class="s.quickCard">
            <span :class="s.quickIcon">🛒</span>
            <span :class="s.quickLabel">{{ t('profile.goMarketplace') }}</span>
          </NuxtLink>
          <NuxtLink to="/profile/orders" :class="s.quickCard">
            <span :class="s.quickIcon">📋</span>
            <span :class="s.quickLabel">{{ t('profile.myOrders') }}</span>
          </NuxtLink>
          <NuxtLink to="/forum" :class="s.quickCard">
            <span :class="s.quickIcon">💬</span>
            <span :class="s.quickLabel">{{ t('profile.community') }}</span>
          </NuxtLink>
          <NuxtLink to="/profile/security" :class="s.quickCard">
            <span :class="s.quickIcon">🛡️</span>
            <span :class="s.quickLabel">{{ t('profile.security') }}</span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <div v-else :class="s.empty">{{ t('profile.loading') }}</div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ title: 'profile.title', requiresAuth: true });
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth.pinia.js';
import Avatar from '@/components/ui/Avatar/Avatar.vue';
import { formatDate } from '@/utils/date.js';
import { ACTIVITIES } from '@/data/profile.js';
import { notificationApi } from '@/api/notification.js';
import { marketplaceApi } from '@/api/marketplace.js';
import { paymentApi } from '@/api/marketplace.js';
import s from './index.vue.module.css';

interface UserProfile {
  id: string;
  name?: string;
  email: string;
  avatar?: string;
  workspaceName?: string;
  workspaceRole?: string;
  bio?: string;
  createdAt: string;
}

const { t } = useI18n();
const auth = useAuthStore();
const user = auth.user as UserProfile | null;

const { data: notifRes } = useAsyncData('profile-notifications-count', () => notificationApi.getNotifications(1, 1), { server: false, default: () => ({ total: 0 }) });
const { data: appsRes } = useAsyncData('profile-my-apps', () => marketplaceApi.getMyApps(), { server: false, default: () => ({ data: [] }) });
const { data: ordersRes } = useAsyncData('profile-orders', () => paymentApi.getOrders({}), { server: false, default: () => ({ data: [] }) });

const stats = computed(() => [
  { icon: '📦', value: (ordersRes.value as any)?.data?.length || 0, label: t('profile.statOrders') },
  { icon: '📱', value: (appsRes.value as any)?.data?.length || 0, label: t('profile.statApps') },
  { icon: '🔔', value: (notifRes.value as any)?.total || 0, label: t('profile.statNotifications') },
  { icon: '⭐', value: '1,280', label: t('profile.statPoints') },
]);

const activities = ACTIVITIES;
</script>
