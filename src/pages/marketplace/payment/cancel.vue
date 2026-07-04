<template>
  <div>
    <main :class="s.page">
      <div class="container">
        <div :class="s.card" class="reveal">
          <div :class="[s.icon, s.iconCancel]">✕</div>
          <h1 :class="s.title">{{ t('marketplace.paymentCancelled') }}</h1>
          <p :class="s.desc">{{ t('marketplace.paymentCancelledDesc') }}</p>
          <div v-if="order" :class="s.orderInfo">
            <p><strong>{{ t('marketplace.orderNo') }}:</strong> {{ order.orderNo }}</p>
            <p><strong>{{ t('marketplace.amount') }}:</strong> {{ order.currency }} {{ order.total }}</p>
          </div>
          <div :class="s.actions">
            <button :class="[s.btnPrimary, s.retryBtn]" :disabled="retrying" @click="handleRetry">
              {{ retrying ? t('common.loading') : t('marketplace.tryAgain') }}
            </button>
            <NuxtLink to="/marketplace/cart" :class="s.btnSecondary">
              {{ t('marketplace.cartTitle') }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { paymentApi } from '@/api/marketplace';
import { showToast } from '@/utils/toast';
import s from './cancel.module.css';

definePageMeta({ title: 'marketplace.paymentCancelled', description: 'marketplace.subtitle' });

interface Order {
  id: string;
  orderNo: string;
  status: string;
  total: number;
  currency: string;
}

const { t } = useI18n();
const route = useRoute();

const order = ref<Order | null>(null);
const retrying = ref(false);

onMounted(async () => {
  const orderId = route.query.order_id;
  if (orderId) {
    try {
      const res = await paymentApi.getOrder(Array.isArray(orderId) ? orderId[0] : orderId);
      order.value = res.data as Order;
    } catch {
      // ignore
    }
  }
});

const handleRetry = async () => {
  if (!order.value) {
    await navigateTo('/marketplace/cart');
    return;
  }
  retrying.value = true;
  try {
    const checkoutRes = await paymentApi.createStripeCheckout({
      orderId: order.value.id,
      successUrl: `${window.location.origin}/marketplace/payment/success?order_id=${order.value.id}`,
      cancelUrl: `${window.location.origin}/marketplace/payment/cancel?order_id=${order.value.id}`,
    });
    if (checkoutRes.data?.url) {
      window.location.href = checkoutRes.data.url;
    } else {
      showToast(t('marketplace.paymentError'), 'error');
    }
  } catch (e) {
    const err = e as { response?: { data?: { message?: string } } };
    showToast(err.response?.data?.message || t('marketplace.paymentError'), 'error');
  } finally {
    retrying.value = false;
  }
};
</script>
