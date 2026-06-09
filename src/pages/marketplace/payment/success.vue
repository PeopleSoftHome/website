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
          <div :class="s.actions">
            <NuxtLink to="/marketplace" :class="s.btnPrimary">
              {{ t('marketplace.backToMarketplace') }}
            </NuxtLink>
            <NuxtLink to="/profile" :class="s.btnSecondary">
              {{ t('marketplace.viewMyApps') }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { paymentApi } from '@/api/marketplace.js';
import s from './success.vue.module.css';

definePageMeta({ title: 'marketplace.paymentSuccess', description: 'marketplace.subtitle' });

const { t } = useI18n();
const route = useRoute();

const order = ref(null);

onMounted(async () => {
  const orderId = route.query.order_id;
  if (orderId) {
    try {
      const res = await paymentApi.getOrder(orderId);
      order.value = res.data;
    } catch {
      // ignore
    }
  }
});

// 自动刷新订单状态（每 3 秒最多刷新 5 次）
const refreshCount = ref(0);
let refreshTimer = null;

onMounted(() => {
  refreshTimer = setInterval(async () => {
    if (!order.value || order.value.status === 'COMPLETED' || refreshCount.value >= 5) {
      clearInterval(refreshTimer);
      return;
    }
    try {
      const res = await paymentApi.getOrder(order.value.id);
      order.value = res.data;
      refreshCount.value++;
    } catch {
      clearInterval(refreshTimer);
    }
  }, 3000);
});

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer);
});
</script>
