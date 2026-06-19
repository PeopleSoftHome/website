<template>
  <div :class="s.wrap">
    <button :class="s.btn" :aria-label="t('cart.title')" @click="open = !open">
      <Icon name="shopping-cart" />
      <span v-if="count > 0" :class="s.badge" aria-hidden="true">{{ count }}</span>
    </button>

    <div v-if="open" :class="s.dropdown">
      <div :class="s.header">
        <h4 :class="s.title">{{ t('cart.title') }}</h4>
        <button v-if="items.length" :class="s.clear" @click="handleClear">{{ t('cart.clear') }}</button>
      </div>

      <div v-if="items.length === 0" :class="s.empty">
        <div :class="s.emptyIcon">🛒</div>
        <p>{{ t('cart.empty') }}</p>
        <NuxtLink to="/marketplace" :class="s.emptyCta" @click="open = false">{{ t('cart.goShopping') }} →</NuxtLink>
      </div>

      <div v-else :class="s.list">
        <div v-for="item in items" :key="item.appId + item.tierName" :class="s.item">
          <div :class="s.itemInfo">
            <span :class="s.itemName">{{ item.name }}</span>
            <span :class="s.itemTier">{{ item.tierName }}</span>
          </div>
          <div :class="s.itemControls">
            <button :class="s.qtyBtn" @click="handleQty(item, -1)">−</button>
            <span :class="s.qtyValue">{{ item.quantity }}</span>
            <button :class="s.qtyBtn" @click="handleQty(item, 1)">+</button>
          </div>
          <div :class="s.itemPrice">
            <span>¥{{ (item.price * item.quantity).toFixed(2) }}</span>
            <button :class="s.remove" @click="handleRemove(item)">×</button>
          </div>
        </div>
      </div>

      <div v-if="items.length" :class="s.footer">
        <div>
          <div :class="s.totalLabel">{{ t('cart.total') }}</div>
          <div :class="s.total">¥{{ total }}</div>
        </div>
        <button :class="s.checkout" @click="handleCheckout">{{ t('cart.checkout') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/auth.pinia.js';
import Icon from '@/components/ui/Icon/Icon.vue';
import { cartApi } from '@/api/marketplace.js';
import { showToast } from '@/utils/toast.js';
import s from './CartButton.module.css';

interface CartItem {
  appId: string;
  tierName: string;
  name: string;
  price: number;
  quantity: number;
}

const { t } = useI18n();
const auth = useAuthStore();

const open = ref(false);
const items = ref<CartItem[]>([]);

const count = computed(() => items.value.reduce((sum, i) => sum + i.quantity, 0));
const total = computed(() => items.value.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2));

const loadCart = async () => {
  if (!auth.isLoggedIn) {
    items.value = [];
    return;
  }
  try {
    const res = await cartApi.getCart();
    items.value = res.data?.items || [];
  } catch {
    items.value = [];
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

const handleClear = async () => {
  try {
    await cartApi.clearCart();
    items.value = [];
  } catch {
    showToast(t('cart.error'), 'error');
  }
};

const handleCheckout = () => {
  open.value = false;
  showToast(t('cart.checkoutComingSoon'), 'info');
};

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (!target.closest('.' + s.wrap)) open.value = false;
};

onMounted(() => {
  loadCart();
  document.addEventListener('click', handleClickOutside);
});
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
