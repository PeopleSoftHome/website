<template>
  <div>
    <div :class="s.header" class="reveal">
      <h2 :class="s.title">{{ t('profile.billing') }}</h2>
    </div>

    <TabNav :tabs="tabs" :active-index="activeTab" variant="pill" :class="s.tabs" @select="activeTab = $event" />

    <!-- Subscriptions -->
    <div v-if="activeTab === 0" :class="s.tabPanel" class="reveal">
      <div v-if="subscriptionsLoading" :class="s.loading">{{ t('common.loading') }}</div>
      <div v-else-if="subscriptions.length === 0" :class="s.empty">
        <div :class="s.emptyIcon">📅</div>
        <p>{{ t('profile.noSubscriptions') }}</p>
        <NuxtLink to="/marketplace" :class="s.emptyCta">{{ t('profile.goMarketplace') }} →</NuxtLink>
      </div>
      <div v-else :class="s.list">
        <div v-for="(sub, i) in subscriptions" :key="sub.id" :class="s.card" :style="{ '--stagger': i }">
          <div :class="s.cardTop">
            <div :class="s.cardIcon">{{ sub.appName?.charAt(0) || 'A' }}</div>
            <div :class="s.cardInfo">
              <div :class="s.cardName">{{ sub.appName }}</div>
              <div :class="s.cardMeta">{{ sub.tierName }} · {{ sub.interval }}</div>
            </div>
            <div :class="[s.statusTag, s[`status_${sub.status}`]]">{{ subscriptionStatusLabel(sub.status) }}</div>
          </div>
          <div :class="s.cardBottom">
            <span :class="s.cardPrice">¥{{ sub.price }}/{{ t('marketplace.month') }}</span>
            <span :class="s.cardDate">{{ sub.currentPeriodEnd ? formatDate(sub.currentPeriodEnd) : '' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Orders -->
    <div v-else-if="activeTab === 1" :class="s.tabPanel" class="reveal">
      <div v-if="ordersLoading" :class="s.loading">{{ t('common.loading') }}</div>
      <div v-else-if="orders.length === 0" :class="s.empty">
        <div :class="s.emptyIcon">📦</div>
        <p>{{ t('profile.noOrders') }}</p>
        <NuxtLink to="/marketplace" :class="s.emptyCta">{{ t('profile.goMarketplace') }} →</NuxtLink>
      </div>
      <div v-else :class="s.list">
        <div v-for="(order, i) in orders" :key="order.id" :class="s.card" :style="{ '--stagger': i }">
          <div :class="s.cardTop">
            <div :class="s.cardIcon">{{ order.appName?.charAt(0) || '📦' }}</div>
            <div :class="s.cardInfo">
              <div :class="s.cardName">{{ order.appName }}</div>
              <div :class="s.cardMeta">{{ order.orderNo || order.id }}</div>
            </div>
            <div :class="[s.statusTag, s[`status_${order.status}`]]">{{ orderStatusLabel(order.status) }}</div>
          </div>
          <div :class="s.cardBottom">
            <span :class="s.cardPrice">¥{{ order.total || order.amount }}</span>
            <span :class="s.cardDate">{{ order.date ? formatDate(order.date) : '' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Invoices -->
    <div v-else :class="s.tabPanel" class="reveal">
      <div v-if="ordersLoading" :class="s.loading">{{ t('common.loading') }}</div>
      <div v-else-if="invoices.length === 0" :class="s.empty">
        <div :class="s.emptyIcon">🧾</div>
        <p>{{ t('profile.noInvoices') }}</p>
      </div>
      <div v-else :class="s.list">
        <div v-for="(inv, i) in invoices" :key="inv.id" :class="s.card" :style="{ '--stagger': i }">
          <div :class="s.cardTop">
            <div :class="s.cardIcon">🧾</div>
            <div :class="s.cardInfo">
              <div :class="s.cardName">{{ inv.appName }}</div>
              <div :class="s.cardMeta">{{ inv.orderNo || inv.id }}</div>
            </div>
            <div :class="[s.statusTag, s[`status_${inv.status}`]]">{{ orderStatusLabel(inv.status) }}</div>
          </div>
          <div :class="s.cardBottom">
            <span :class="s.cardPrice">¥{{ inv.total || inv.amount }}</span>
            <button v-if="inv.status === 'completed'" :class="s.invoiceBtn" @click="openInvoice(inv)">{{ t('profile.requestInvoice') }}</button>
            <span v-else-if="inv.invoiceRequested" :class="s.invoiceRequested">{{ t('profile.invoiceRequested') }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Invoice Dialog -->
    <BaseModal :is-open="invoiceOpen" aria-label="request invoice" :overlay-class-name="s.overlay" @close="invoiceOpen = false">
      <div :class="s.modal">
        <h3 :class="s.modalTitle">{{ t('profile.requestInvoice') }}</h3>
        <label :class="s.modalField">
          <span>{{ t('profile.invoiceTitle') }}</span>
          <input v-model="invoiceForm.title" type="text" :class="s.modalInput" />
        </label>
        <label :class="s.modalField">
          <span>{{ t('profile.invoiceTaxNo') }}</span>
          <input v-model="invoiceForm.taxNo" type="text" :class="s.modalInput" />
        </label>
        <div :class="s.modalActions">
          <button :class="s.modalCancel" @click="invoiceOpen = false">{{ t('common.cancel') }}</button>
          <button :class="s.modalSubmit" :disabled="submittingInvoice" @click="submitInvoice">{{ t('common.confirm') }}</button>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import TabNav from '@/components/ui/TabNav/TabNav.vue';
import BaseModal from '@/components/ui/BaseModal/BaseModal.vue';
import { paymentApi, marketplaceApi } from '@/api/marketplace';
import { showToast } from '@/utils/toast';
import { formatDate } from '@/shared/utils/date';
import s from './billing.module.css';

definePageMeta({ title: 'profile.billing', requiresAuth: true });

interface Subscription {
  id: string;
  appName: string;
  tierName: string;
  status: string;
  price: number;
  interval: string;
  currentPeriodEnd?: string;
}

interface Order {
  id: string;
  orderNo?: string;
  appName: string;
  status: string;
  total?: number;
  amount?: number;
  date?: string;
  invoiceRequested?: boolean;
  providerPaymentId?: string;
}

const { t } = useI18n();
const activeTab = ref(0);

const tabs = computed(() => [
  { id: 'subscriptions', label: t('profile.billingSubscriptions') },
  { id: 'orders', label: t('profile.billingOrders') },
  { id: 'invoices', label: t('profile.billingInvoices') },
]);

const { data: subscriptionsRes, pending: subscriptionsLoading } = useAsyncData('profile-subscriptions', async () => {
  try {
    return await paymentApi.getSubscriptions();
  } catch {
    return await marketplaceApi.getMySubscriptions();
  }
}, { server: false, default: () => ({ data: [] }) });

const { data: ordersRes, pending: ordersLoading } = useAsyncData('profile-billing-orders', () => paymentApi.getOrders({}), { server: false, default: () => ({ data: { data: [], meta: { total: 0 } } }) });

const subscriptions = computed<Subscription[]>(() => (subscriptionsRes.value?.data as Subscription[] | undefined) || []);
const orders = computed<Order[]>(() => ((ordersRes.value?.data as { data?: Order[] } | undefined)?.data) || []);
const invoices = computed<Order[]>(() => orders.value.filter((o) => o.invoiceRequested || o.status === 'completed'));

const subscriptionStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    active: t('profile.subscriptionStatus.active'),
    trialing: t('profile.subscriptionStatus.trialing'),
    expired: t('profile.subscriptionStatus.expired'),
    cancelled: t('profile.subscriptionStatus.cancelled'),
    past_due: t('profile.subscriptionStatus.pastDue'),
  };
  return map[status] || status;
};

const orderStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    pending: t('profile.orderStatus.pending'),
    completed: t('profile.orderStatus.completed'),
    refunded: t('profile.orderStatus.refunded'),
    failed: t('profile.orderStatus.failed'),
  };
  return map[status] || status;
};

const invoiceOpen = ref(false);
const submittingInvoice = ref(false);
const invoiceForm = ref({ title: '', taxNo: '', orderId: '' });

const openInvoice = (order: Order) => {
  invoiceForm.value = { title: '', taxNo: '', orderId: order.id };
  invoiceOpen.value = true;
};

const submitInvoice = async () => {
  if (!invoiceForm.value.title.trim() || !invoiceForm.value.taxNo.trim()) return;
  submittingInvoice.value = true;
  try {
    await paymentApi.requestInvoice(invoiceForm.value.orderId, {
      title: invoiceForm.value.title,
      taxNo: invoiceForm.value.taxNo,
    });
    invoiceOpen.value = false;
    showToast(t('profile.invoiceRequested'), 'success');
  } catch (e) {
    const err = e as { response?: { data?: { message?: string } } };
    showToast(err.response?.data?.message || t('cart.error'), 'error');
  } finally {
    submittingInvoice.value = false;
  }
};
</script>
