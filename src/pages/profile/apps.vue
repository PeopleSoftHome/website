<template>
  <div>
    <div :class="s.header" class="reveal">
      <h2 :class="s.title">{{ t('profile.menu.apps') }}</h2>
    </div>

    <div v-if="loading" :class="s.loading">{{ t('common.loading') }}</div>
    <div v-else-if="apps.length === 0" :class="s.empty">
      <div :class="s.emptyIcon">📦</div>
      <p>{{ t('profile.noApps') }}</p>
      <NuxtLink to="/marketplace" :class="s.emptyCta">{{ t('profile.goMarketplace') }} →</NuxtLink>
    </div>

    <div v-else :class="s.list">
      <div v-for="(app, i) in apps" :key="app.id" :class="s.card" :style="{ '--stagger': i }">
        <div :class="s.cardTop">
          <div :class="s.cardIcon">{{ appIcon(app) }}</div>
          <div :class="s.cardInfo">
            <div :class="s.cardName">{{ appName(app) }}</div>
            <div :class="s.cardMeta">{{ appMeta(app) }}</div>
          </div>
          <div :class="[s.statusTag, s[`status_${app.status}`]]">{{ statusLabel(app.status) }}</div>
        </div>
        <div :class="s.cardBottom">
          <span :class="s.cardPrice">{{ appPrice(app) }}</span>
          <NuxtLink :to="`/marketplace/${appSlug(app)}`" :class="s.cardLink">{{ t('marketplace.appDetail') }} →</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ title: 'profile.menu.apps', requiresAuth: true });
import { computed } from 'vue';
import { marketplaceApi } from '@/api/marketplace';
import { formatDate } from '@/shared/utils/date';
import s from './apps.module.css';

interface AppItem {
  id: string;
  status: string;
  tierName: string;
  amount: number;
  pricingModel: string;
  interval: string;
  trialEndsAt?: string;
  currentPeriodEnd?: string;
  app?: {
    name: string;
    slug: string;
    icon?: string;
    pricingModel?: string;
  };
  appName?: string;
  appSlug?: string;
}

const { t } = useI18n();

const { data: appsRes, pending: loading } = useAsyncData('profile-apps-page', () => marketplaceApi.getMyApps(), { server: false, default: () => ({ data: [] }) });

const apps = computed<AppItem[]>(() => (appsRes.value?.data as AppItem[] | undefined) || []);

const appName = (item: AppItem) => item.app?.name || item.appName || t('profile.unknownApp');
const appSlug = (item: AppItem) => item.app?.slug || item.appSlug || '';
const appIcon = (item: AppItem) => item.app?.icon || '📦';
const appMeta = (item: AppItem) => {
  const tier = item.tierName || '';
  const period = item.currentPeriodEnd ? formatDate(item.currentPeriodEnd) : (item.trialEndsAt ? formatDate(item.trialEndsAt) : '');
  return [tier, period].filter(Boolean).join(' · ');
};
const appPrice = (item: AppItem) => {
  const model = item.app?.pricingModel || item.pricingModel;
  if (model === 'FREE' || item.amount === 0) return t('marketplace.priceFree');
  return `¥${item.amount}/${t('marketplace.month')}`;
};

const statusLabel = (status: string) => {
  const map: Record<string, string> = {
    TRIAL: t('profile.subscriptionStatus.trialing'),
    ACTIVE: t('profile.subscriptionStatus.active'),
    PAST_DUE: t('profile.subscriptionStatus.pastDue'),
    CANCELLED: t('profile.subscriptionStatus.cancelled'),
    EXPIRED: t('profile.subscriptionStatus.expired'),
  };
  return map[status] || status;
};
</script>
