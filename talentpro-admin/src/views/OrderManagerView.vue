<!--
  Order Manager View 组件

  位于: views/OrderManagerView.vue
-->
<template>
  <div>
    <h2 style="margin-bottom: 20px">{{ t('orders.title') }}</h2>
    <el-card shadow="hover">
      <OrderManagerFilters
        v-model:filterStatus="filterStatus"
        v-model:filterProvider="filterProvider"
        :statusMap="statusMap"
        :providerMap="providerMap"
        @change="handleFilterChange"
      />

      <CmsTable
        ref="tableRef"
        api-url="/payments/admin/marketplace/orders"
        :columns="columns"
        :form-fields="formFields"
        :api-params="apiParams"
      >
        <template #column-appName="{ row }">
          <span>{{ row.subscription?.app?.name || row.appName || '-' }}</span>
        </template>
        <template #column-status="{ row }">
          <el-tag :type="statusType(row.status)" size="small">
            {{ statusLabel(row.status) }}
          </el-tag>
        </template>
        <template #column-provider="{ row }">
          <el-tag size="small">{{ providerLabel(row.provider) }}</el-tag>
        </template>
        <template #column-total="{ row }">
          <span>¥ {{ row.total }}</span>
        </template>
        <template #column-paidAt="{ row }">
          <span>{{ formatDate(row.paidAt) }}</span>
        </template>
        <template #column-createdAt="{ row }">
          <span>{{ formatDate(row.createdAt) }}</span>
        </template>
        <template #column-invoiceRequested="{ row }">
          <el-tag :type="row.invoiceRequested ? 'warning' : 'info'" size="small">
            {{ row.invoiceRequested ? t('orders.requested') : t('orders.notRequested') }}
          </el-tag>
        </template>
        <template #actions="{ row }">
          <el-button link type="primary" @click="openDetailDialog(row)">{{ t('orders.view') }}</el-button>
          <el-button link type="warning" @click="openStatusDialog(row)">{{ t('orders.updateStatus') }}</el-button>
          <el-button link :type="row.invoiceRequested ? 'warning' : 'info'" @click="openInvoiceDialog(row)">
            {{ t('orders.invoiceLabel') }}
          </el-button>
        </template>
      </CmsTable>
    </el-card>

    <!-- 订单详情 -->
    <OrderManagerDetailDialog
      v-model:modelValue="detailVisible"
      :detail="detail"
      :statusType="statusType"
      :statusLabel="statusLabel"
      :providerLabel="providerLabel"
    />

    <!-- 更新状态 -->
    <OrderManagerStatusDialog
      v-model:modelValue="statusDialogVisible"
      v-model:form="statusForm"
      :statusMap="statusMap"
      :statusType="statusType"
      :statusLabel="statusLabel"
      :saving="statusSaving"
      @save="handleStatusSave"
    />

    <!-- 发票信息 -->
    <OrderManagerInvoiceDialog
      v-model:modelValue="invoiceDialogVisible"
      v-model:form="invoiceForm"
      :saving="invoiceSaving"
      @save="handleInvoiceSave"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import CmsTable from '@/components/ui/CmsTable.vue';
import client from '@/api/client.js';
import { formatDate } from '@/utils/formatDate.js';
import OrderManagerFilters from '@/components/order-manager/OrderManagerFilters.vue';
import OrderManagerDetailDialog from '@/components/order-manager/OrderManagerDetailDialog.vue';
import OrderManagerStatusDialog from '@/components/order-manager/OrderManagerStatusDialog.vue';
import OrderManagerInvoiceDialog from '@/components/order-manager/OrderManagerInvoiceDialog.vue';

const { t } = useI18n();

const tableRef = ref(null);
const filterStatus = ref('');
const filterProvider = ref('');
const apiParams = ref({});

const statusMap = computed(() => ({
  PENDING: t('orders.statusOptions.PENDING'),
  PROCESSING: t('orders.statusOptions.PROCESSING'),
  COMPLETED: t('orders.statusOptions.COMPLETED'),
  FAILED: t('orders.statusOptions.FAILED'),
  REFUNDED: t('orders.statusOptions.REFUNDED'),
  CANCELLED: t('orders.statusOptions.CANCELLED'),
}));

const providerMap = computed(() => ({
  STRIPE: t('revenueAnalytics.providers.STRIPE'),
  ALIPAY: t('revenueAnalytics.providers.ALIPAY'),
  WECHAT_PAY: t('revenueAnalytics.providers.WECHAT_PAY'),
  BANK_TRANSFER: t('revenueAnalytics.providers.BANK_TRANSFER'),
}));

const columns = [
  { prop: 'orderNo', label: t('orders.orderNo'), minWidth: 180 },
  { prop: 'appName', label: t('orders.appName'), minWidth: 160 },
  { prop: 'userId', label: t('orders.userId'), width: 120 },
  { prop: 'total', label: t('orders.total'), width: 100 },
  { prop: 'status', label: t('orders.status'), width: 100 },
  { prop: 'provider', label: t('orders.provider'), width: 100 },
  { prop: 'paidAt', label: t('orders.paidAt'), width: 160 },
  { prop: 'invoiceRequested', label: t('orders.invoice'), width: 90 },
  { prop: 'createdAt', label: t('orders.createdAt'), width: 160 },
];

const formFields = [
  { prop: 'orderNo', label: t('orders.orderNo'), type: 'input' },
  { prop: 'appName', label: t('orders.appName'), type: 'input' },
  { prop: 'userId', label: t('orders.userId'), type: 'input' },
  { prop: 'total', label: t('orders.total'), type: 'number' },
  { prop: 'status', label: t('orders.status'), type: 'input' },
  { prop: 'provider', label: t('orders.provider'), type: 'input' },
];

const statusType = (s) => {
  const map = {
    PENDING: 'warning',
    PROCESSING: 'primary',
    COMPLETED: 'success',
    FAILED: 'danger',
    REFUNDED: 'info',
    CANCELLED: 'info',
  };
  return map[s] || 'info';
};

const statusLabel = (s) => statusMap.value[s] || s;
const providerLabel = (p) => providerMap.value[p] || p;

const handleFilterChange = () => {
  apiParams.value = {};
  if (filterStatus.value) apiParams.value.status = filterStatus.value;
  if (filterProvider.value) apiParams.value.provider = filterProvider.value;
  if (tableRef.value) {
    tableRef.value.setParams(apiParams.value);
    tableRef.value.refresh();
  }
};

// 详情弹窗
const detailVisible = ref(false);
const detail = ref({});

const openDetailDialog = (row) => {
  detail.value = {
    orderNo: row.orderNo,
    appName: row.subscription?.app?.name || row.appName || '-',
    userId: row.userId,
    total: row.total,
    status: row.status,
    provider: row.provider,
    paidAt: row.paidAt,
    createdAt: row.createdAt,
    invoiceRequested: row.invoiceRequested,
    invoiceNo: row.invoiceNo,
  };
  detailVisible.value = true;
};

// 状态弹窗
const statusDialogVisible = ref(false);
const statusSaving = ref(false);
const statusForm = ref({ id: '', orderNo: '', currentStatus: '', status: '', reason: '' });

const openStatusDialog = (row) => {
  statusForm.value = {
    id: row.id,
    orderNo: row.orderNo,
    currentStatus: row.status,
    status: row.status,
    reason: '',
  };
  statusDialogVisible.value = true;
};

const handleStatusSave = async () => {
  statusSaving.value = true;
  try {
    await client.patch(`/payments/admin/marketplace/orders/${statusForm.value.id}/status`, {
      status: statusForm.value.status,
      reason: statusForm.value.reason,
    });
    ElMessage.success(t('orders.statusUpdateSuccess'));
    statusDialogVisible.value = false;
    if (tableRef.value) tableRef.value.refresh();
  } catch (e) {
    ElMessage.error(e.response?.data?.message || t('orders.updateFailed'));
  } finally {
    statusSaving.value = false;
  }
};

// 发票弹窗
const invoiceDialogVisible = ref(false);
const invoiceSaving = ref(false);
const invoiceForm = ref({ id: '', orderNo: '', invoiceRequested: false, invoiceNo: '' });

const openInvoiceDialog = (row) => {
  invoiceForm.value = {
    id: row.id,
    orderNo: row.orderNo,
    invoiceRequested: row.invoiceRequested ?? false,
    invoiceNo: row.invoiceNo || '',
  };
  invoiceDialogVisible.value = true;
};

const handleInvoiceSave = async () => {
  invoiceSaving.value = true;
  try {
    await client.patch(`/payments/admin/marketplace/orders/${invoiceForm.value.id}/invoice`, {
      invoiceRequested: invoiceForm.value.invoiceRequested,
      invoiceNo: invoiceForm.value.invoiceNo,
    });
    ElMessage.success(t('orders.invoiceUpdateSuccess'));
    invoiceDialogVisible.value = false;
    if (tableRef.value) tableRef.value.refresh();
  } catch (e) {
    ElMessage.error(e.response?.data?.message || t('orders.updateFailed'));
  } finally {
    invoiceSaving.value = false;
  }
};
</script>
