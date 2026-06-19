<template>
  <div>
    <main :class="s.page">
      <div class="container">
        <div :class="s.layout">
          <!-- Sidebar -->
          <aside :class="s.sidebar">
            <div :class="s.userBrief">
              <Avatar :src="user?.avatar" :name="user?.name || user?.email" :size="48" />
              <div :class="s.userBriefInfo">
                <div :class="s.userBriefName">{{ user?.name || user?.email }}</div>
                <div :class="s.userBriefEmail">{{ user?.email }}</div>
              </div>
            </div>
            <nav :class="s.nav">
              <NuxtLink v-for="item in menu" :key="item.to" :to="item.to" :class="[s.navLink, route.path === item.to && s.navLinkActive]">
                <span :class="s.navIcon">{{ item.icon }}</span>
                <span>{{ item.label }}</span>
              </NuxtLink>
            </nav>
          </aside>

          <!-- Content -->
          <div :class="s.content">
            <NuxtPage />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
definePageMeta({ title: 'profile.title', requiresAuth: true });
import { useAuthStore } from '@/stores/auth.pinia.js';
import Avatar from '@/components/ui/Avatar/Avatar.vue';
import s from './profile.vue.module.css';

const route = useRoute();
const auth = useAuthStore();
const user = auth.user;

const { t } = useI18n();

const menu = [
  { to: '/profile', label: t('profile.menu.dashboard'), icon: '📊' },
  { to: '/profile/orders', label: t('profile.menu.orders'), icon: '📦' },
  { to: '/profile/settings', label: t('profile.menu.settings'), icon: '⚙️' },
  { to: '/profile/security', label: t('profile.menu.security'), icon: '🔒' },
];
</script>
