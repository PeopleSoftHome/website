<!--
  Order Manager Detail Dialog 组件

  位于: components/order-manager/OrderManagerDetailDialog.vue
-->
<template>
  <el-dialog
    :model-value="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    :title="t('orders.detailDialog')"
    width="560px"
    destroy-on-close
  >
    <el-descriptions :column="2" border size="small">
      <el-descriptions-item :label="t('orders.orderNo')" :span="2">{{ detail.orderNo }}</el-descriptions-item>
      <el-descriptions-item :label="t('orders.appName')">{{ detail.appName }}</el-descriptions-item>
      <el-descriptions-item :label="t('orders.userId')">{{ detail.userId }}</el-descriptions-item>
      <el-descriptions-item :label="t('orders.total')">¥ {{ detail.total }}</el-descriptions-item>
      <el-descriptions-item :label="t('orders.status')">
        <el-tag :type="statusType(detail.status)" size="small">{{ statusLabel(detail.status) }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item :label="t('orders.provider')">{{ providerLabel(detail.provider) }}</el-descriptions-item>
      <el-descriptions-item :label="t('orders.paidAt')">{{ formatDate(detail.paidAt) }}</el-descriptions-item>
      <el-descriptions-item :label="t('orders.createdAt')">{{ formatDate(detail.createdAt) }}</el-descriptions-item>
      <el-descriptions-item :label="t('orders.invoiceRequested')">
        <el-tag :type="detail.invoiceRequested ? 'warning' : 'info'" size="small">
          {{ detail.invoiceRequested ? t('orders.requested') : t('orders.notRequested') }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item :label="t('orders.invoiceNo')">{{ detail.invoiceNo || '-' }}</el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">{{ t('orders.close') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { formatDate } from '@/utils/formatDate';

const { t } = useI18n();

defineProps({
  modelValue: Boolean,
  detail: { type: Object, default: () => ({}) },
  statusType: { type: Function, required: true },
  statusLabel: { type: Function, required: true },
  providerLabel: { type: Function, required: true },
});

defineEmits(['update:modelValue']);
</script>
