<template>
  <div :class="s.wrap">
    <button :class="s.btn" @click="open = !open">
      <Icon name="shopping-cart" />
      <span v-if="count > 0" :class="s.badge">{{ count }}</span>
    </button>

    <div v-if="open" :class="s.dropdown">
      <div :class="s.header">
        <h4 :class="s.title">{{ t('cart.title') }}</h4>
        <button v-if="items.length" :class="s.clear" @click="handleClear">
          {{ t('cart.clear') }}
        </button>
      </div>

      <div v-if="items.length === 0" :class="s.empty">
        {{ t('cart.empty') }}
      </div>

      <div v-else :class="s.list">
        <div v-for="item in items" :key="item.appId + item.tierName" :class="s.item">
          <div :class="s.itemInfo">
            <span :class="s.itemName">{{ item.name }}</span>
            <span :class="s.itemTier">{{ item.tierName }}</span>
          </div>
          <div :class="s.itemPrice">
            <span>{{ item.currency }} {{ item.price }} × {{ item.quantity }}</span>
            <button :class="s.remove" @click="handleRemove(item)">×</button>
          </div>
        </div>
      </div>

      <div v-if="items.length" :class="s.footer">
        <span :class="s.total">{{ t('cart.total') }}: {{ total }}</span>
        <button :class="s.checkout" @click="handleCheckout">
          {{ t('cart.checkout') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { cartApi } from '@/api/marketplace.js';
import { showToast } from '@/utils/toast.js';
import s from './CartButton.module.css';

const { t } = useI18n();

const open = ref(false);
const items = ref([]);

const count = computed(() => items.value.reduce((sum, i) => sum + i.quantity, 0));
const total = computed(() => {
  return items.value.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2);
});

const loadCart = async () => {
  try {
    const res = await cartApi.getCart();
    items.value = res.data?.items || [];
  } catch {
    items.value = [];
  }
};

const handleRemove = async (item) => {
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

const handleClickOutside = (e) => {
  if (!e.target.closest('.' + s.wrap)) {
    open.value = false;
  }
};

onMounted(() => {
  loadCart();
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
