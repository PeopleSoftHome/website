<template>
  <div>
    <main :class="s.page">
      <div class="container">
        <div :class="s.card" class="reveal">
          <div :class="s.icon">✓</div>
          <h1 :class="s.title">{{ t('marketplace.paymentSuccess') }}</h1>
          <p :class="s.desc">{{ t('marketplace.paymentSuccessDesc') }}</p>
          <div v-if="order" :class="s.orderInfo">
            <p><strong>{{ t('marketplace.orderNo') }}:</strong> {{ order.orderNo }}</p>
            <p><strong>{{ t('marketplace.amount') }}:</strong> {{ order.currency }} {{ order.total }}</p>
          </div>
          <div v-else-if="loading" :class="s.loadingOrder">{{ t('common.loading') }}</div>
          <div :class="s.actions">
            <NuxtLink to="/marketplace" :class="s.btnPrimary">
              {{ t('marketplace.backToMarketplace') }}
            </NuxtLink>
            <NuxtLink to="/profile/billing" :class="s.btnSecondary">
              {{ t('marketplace.viewMyApps') }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { paymentApi } from '@/api/marketplace';
import s from './success.module.css';

definePageMeta({ title: 'marketplace.paymentSuccess', description: 'marketplace.subtitle' });

interface Order {
  id: string;
  orderNo: string;
  status: string;
  total: number;
  currency: string;
  providerPaymentId?: string;
}

const { t } = useI18n();
const route = useRoute();

const order = ref<Order | null>(null);
const loading = ref(true);
const refreshCount = ref(0);
let refreshTimer: ReturnType<typeof setInterval> | null = null;

const stopPolling = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
};

const queryValue = (val: unknown): string | undefined => {
  if (Array.isArray(val)) return (val[0] as string) || undefined;
  return (val as string) || undefined;
};

const loadOrderById = async (id: string) => {
  try {
    const res = await paymentApi.getOrder(id);
    order.value = res.data as Order;
  } catch {
    // ignore
  } finally {
    loading.value = false;
  }
};

const resolveOrderBySessionId = async (sessionId: string) => {
  try {
    const res = await paymentApi.getOrders({});
    const orders = ((res.data as { data?: Order[] } | undefined)?.data) || [];
    const matched = orders.find((o) => o.providerPaymentId === sessionId);
    if (matched) {
      order.value = matched;
      return true;
    }
  } catch {
    // ignore
  }
  return false;
};

const startPolling = () => {
  stopPolling();
  refreshTimer = setInterval(async () => {
    if (refreshCount.value >= 10) {
      stopPolling();
      return;
    }

    const sessionId = queryValue(route.query.session_id);
    if (sessionId) {
      const found = await resolveOrderBySessionId(sessionId);
      if (found && order.value?.status === 'COMPLETED') {
        stopPolling();
        return;
      }
    } else if (order.value) {
      try {
        const res = await paymentApi.getOrder(order.value.id);
        order.value = res.data as Order;
        if (order.value.status === 'COMPLETED') {
          stopPolling();
          return;
        }
      } catch {
        stopPolling();
        return;
      }
    }
    refreshCount.value++;
  }, 3000);
};

onMounted(async () => {
  const orderId = queryValue(route.query.order_id);
  const sessionId = queryValue(route.query.session_id);

  if (orderId) {
    await loadOrderById(orderId);
  } else if (sessionId) {
    await resolveOrderBySessionId(sessionId);
    loading.value = false;
  } else {
    loading.value = false;
  }

  startPolling();
});

onUnmounted(stopPolling);
</script>
