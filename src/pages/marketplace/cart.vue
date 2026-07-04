<template>
  <div>
    <main :class="s.page">
      <div class="container">
        <Breadcrumb :items="[
          { label: t('marketplace.title'), to: '/marketplace' },
          { label: t('marketplace.cartTitle') },
        ]" />

        <div :class="s.header" class="reveal">
          <h1 :class="s.title">{{ t('marketplace.cartTitle') }}</h1>
          <p v-if="itemCount > 0" :class="s.subtitle">{{ t('cart.itemCount', { n: itemCount }) }}</p>
        </div>

        <div v-if="loading" :class="s.loading">{{ t('common.loading') }}</div>

        <div v-else-if="items.length === 0" :class="s.empty" class="reveal">
          <div :class="s.emptyIcon">🛒</div>
          <p>{{ t('marketplace.cartEmpty') }}</p>
          <NuxtLink to="/marketplace" :class="s.emptyCta">{{ t('marketplace.cartContinue') }} →</NuxtLink>
        </div>

        <div v-else :class="s.layout" class="reveal">
          <div :class="s.items">
            <div v-for="item in items" :key="`${item.appId}-${item.tierName}`" :class="s.item">
              <div :class="s.itemIcon">{{ item.name?.charAt(0) || 'A' }}</div>
              <div :class="s.itemInfo">
                <div :class="s.itemName">{{ item.name }}</div>
                <div :class="s.itemMeta">{{ item.tierName }} · ¥{{ item.price }}/{{ t('marketplace.month') }}</div>
              </div>
              <div :class="s.itemControls">
                <button :class="s.qtyBtn" @click="handleQty(item, -1)">−</button>
                <span :class="s.qtyValue">{{ item.quantity }}</span>
                <button :class="s.qtyBtn" @click="handleQty(item, 1)">+</button>
              </div>
              <div :class="s.itemTotal">
                <span>¥{{ (item.price * item.quantity).toFixed(2) }}</span>
                <button :class="s.remove" @click="handleRemove(item)">{{ t('cart.remove') }}</button>
              </div>
            </div>
          </div>

          <div :class="s.summary">
            <h3 :class="s.summaryTitle">{{ t('cart.total') }}</h3>
            <div :class="s.summaryRow">
              <span>{{ t('marketplace.orderSubtotal') }}</span>
              <span>¥{{ subtotal.toFixed(2) }}</span>
            </div>
            <div :class="s.summaryRow">
              <span>{{ t('marketplace.orderDiscount') }}</span>
              <span v-if="discount > 0">-¥{{ discount.toFixed(2) }}</span>
              <span v-else>—</span>
            </div>
            <div :class="s.summaryRow">
              <span>{{ t('marketplace.orderTax') }}</span>
              <span>¥{{ tax.toFixed(2) }}</span>
            </div>
            <div :class="[s.summaryRow, s.summaryTotal]">
              <span>{{ t('marketplace.orderTotal') }}</span>
              <span>¥{{ total.toFixed(2) }}</span>
            </div>

            <div :class="s.coupon">
              <input v-model="couponCode" type="text" :placeholder="t('marketplace.orderDiscount')" :class="s.couponInput" />
              <button :class="s.couponBtn" @click="applyCoupon">{{ t('common.apply') }}</button>
            </div>

            <button :class="s.checkout" :disabled="checkingOut" @click="handleCheckout">
              {{ checkingOut ? t('common.loading') : t('marketplace.cartCheckout') }}
            </button>
            <NuxtLink to="/marketplace" :class="s.continue">{{ t('marketplace.cartContinue') }}</NuxtLink>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb.vue';
import { cartApi, paymentApi } from '@/api/marketplace';
import { showToast } from '@/utils/toast';
import { useAuthStore } from '@/stores/auth.pinia';
import s from './cart.module.css';

definePageMeta({ title: 'marketplace.cartTitle', description: 'marketplace.subtitle' });

interface CartItem {
  appId: string;
  slug: string;
  name: string;
  tierName: string;
  price: number;
  currency: string;
  quantity: number;
}

const { t } = useI18n();
const auth = useAuthStore();

const items = ref<CartItem[]>([]);
const loading = ref(true);
const checkingOut = ref(false);
const couponCode = ref('');
const discount = ref(0);
const tax = ref(0);

const itemCount = computed(() => items.value.reduce((sum, i) => sum + i.quantity, 0));
const subtotal = computed(() => items.value.reduce((sum, i) => sum + i.price * i.quantity, 0));
const total = computed(() => Math.max(0, subtotal.value - discount.value + tax.value));

const loadCart = async () => {
  if (!auth.isLoggedIn) {
    items.value = [];
    loading.value = false;
    return;
  }
  try {
    const res = await cartApi.getCart();
    items.value = res.data?.items || [];
  } catch {
    showToast(t('cart.error'), 'error');
  } finally {
    loading.value = false;
  }
};

const handleQty = async (item: CartItem, delta: number) => {
  const next = item.quantity + delta;
  if (next < 1) return;
  try {
    await cartApi.updateItem(item.appId, item.tierName, next);
    await loadCart();
  } catch {
    showToast(t('cart.error'), 'error');
  }
};

const handleRemove = async (item: CartItem) => {
  try {
    await cartApi.removeItem(item.appId, item.tierName);
    await loadCart();
  } catch {
    showToast(t('cart.error'), 'error');
  }
};

const applyCoupon = () => {
  if (!couponCode.value.trim()) return;
  // Placeholder coupon logic: 10% off for code "SAVE10"
  discount.value = couponCode.value.trim().toUpperCase() === 'SAVE10' ? subtotal.value * 0.1 : 0;
  if (discount.value <= 0) {
    showToast(t('profile.couponInvalid') || t('cart.error'), 'error');
  }
};

const handleCheckout = async () => {
  if (!auth.isLoggedIn) {
    showToast(t('auth.pleaseLogin'), 'error');
    return;
  }
  if (items.value.length === 0) return;

  checkingOut.value = true;
  try {
    const checkoutItems = items.value.map((item) => ({
      appId: item.appId,
      tierName: item.tierName,
      amount: Number((item.price * item.quantity).toFixed(2)),
      currency: item.currency || 'CNY',
      interval: 'month',
      quantity: item.quantity,
    }));

    const res = await paymentApi.checkoutCart({ items: checkoutItems });
    if (res.data?.url) {
      window.location.href = res.data.url;
    } else {
      showToast(t('cart.checkoutError'), 'error');
    }
  } catch (e) {
    const err = e as { response?: { data?: { message?: string } } };
    showToast(err.response?.data?.message || t('cart.checkoutError'), 'error');
  } finally {
    checkingOut.value = false;
  }
};

onMounted(() => {
  loadCart();
});
</script>
