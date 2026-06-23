<template>
  <div>
    <div :class="s.header" class="reveal">
      <h2 :class="s.title">{{ t('profile.menu.orders') }}</h2>
    </div>

    <div :class="s.filter" class="reveal">
      <button v-for="st in statuses" :key="st.value" :class="[s.filterBtn, activeStatus === st.value && s.filterActive]" @click="activeStatus = st.value">
        {{ st.label }}
      </button>
    </div>

    <div v-if="loading" :class="s.loading">{{ t('common.loading') }}</div>
    <div v-else-if="displayOrders.length === 0" :class="s.empty">
      <div :class="s.emptyIcon">📦</div>
      <p>{{ t('profile.noOrders') }}</p>
      <NuxtLink to="/marketplace" :class="s.emptyCta">{{ t('profile.goMarketplace') }} →</NuxtLink>
    </div>

    <div v-else :class="s.list">
      <div v-for="(order, i) in displayOrders" :key="order.id" :class="s.orderCard" :style="{ '--stagger': i }">
        <div :class="s.orderTop">
          <div :class="s.orderIcon">{{ order.icon || '📦' }}</div>
          <div :class="s.orderInfo">
            <div :class="s.orderName">{{ order.appName }}</div>
            <div :class="s.orderId">{{ order.id }}</div>
          </div>
          <div :class="s.orderAmount">¥{{ order.amount }}</div>
        </div>
        <div :class="s.orderBottom">
          <span :class="[s.statusTag, s[`status_${order.status}`]]">{{ statusLabel(order.status) }}</span>
          <span :class="s.orderDate">{{ order.date }}</span>
        </div>
        <!-- Progress for pending -->
        <div v-if="order.status === 'pending'" :class="s.progress">
          <div :class="s.progressBar"><div :class="s.progressFill" style="width:50%" /></div>
          <div :class="s.progressSteps">
            <span :class="s.progressStepActive">{{ t('profile.orderStep.order') }}</span>
            <span :class="s.progressStepActive">{{ t('profile.orderStep.pending') }}</span>
            <span>{{ t('profile.orderStep.complete') }}</span>
          </div>
        </div>
        <div v-else-if="order.status === 'completed'" :class="s.progress">
          <div :class="s.progressBar"><div :class="s.progressFill" style="width:100%" /></div>
          <div :class="s.progressSteps">
            <span :class="s.progressStepActive">{{ t('profile.orderStep.order') }}</span>
            <span :class="s.progressStepActive">{{ t('profile.orderStep.pay') }}</span>
            <span :class="s.progressStepActive">{{ t('profile.orderStep.complete') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ title: 'profile.menu.orders', requiresAuth: true });
import { ref, computed } from 'vue';
import { paymentApi } from '@/api/marketplace.js';
import { ORDER_STATUSES, ORDER_FALLBACK } from '@/data/profile.js';
import s from './orders.module.css';

interface Order {
  id: string;
  appName: string;
  amount: number;
  status: string;
  date: string;
  icon?: string;
}

const { t } = useI18n();
const activeStatus = ref('all');
const statuses = ORDER_STATUSES;

const { data: ordersRes, pending: loading } = useAsyncData('profile-orders-page', () => paymentApi.getOrders({}), { server: false, default: () => ({ data: ORDER_FALLBACK as Order[] }) });

const orders = computed<Order[]>(() => (ordersRes.value?.data as Order[] | undefined) || []);

const filteredOrders = computed(() => {
  if (activeStatus.value === 'all') return orders.value;
  return orders.value.filter((o: Order) => o.status === activeStatus.value);
});

const displayOrders = computed(() => filteredOrders.value.map((o: Order, i: number) => ({ ...o, _stagger: i })));

const statusLabel = (status: string) => {
  const map: Record<string, string> = {
    pending: t('profile.orderStatus.pending'),
    completed: t('profile.orderStatus.completed'),
    refunded: t('profile.orderStatus.refunded'),
    failed: t('profile.orderStatus.failed'),
  };
  return map[status] || status;
};
</script>
