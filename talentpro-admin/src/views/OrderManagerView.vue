<template>
  <div>
    <h2 style="margin-bottom: 20px">{{ t('orders.title') }}</h2>
    <el-card shadow="hover">
      <div style="margin-bottom: 16px; display: flex; gap: 12px; flex-wrap: wrap">
        <el-select v-model="filterStatus" :placeholder="t('orders.allStatus')" clearable style="width: 140px" @change="handleFilterChange">
          <el-option v-for="(label, key) in statusMap" :key="key" :label="label" :value="key" />
        </el-select>
        <el-select v-model="filterProvider" :placeholder="t('orders.allProviders')" clearable style="width: 140px" @change="handleFilterChange">
          <el-option v-for="(label, key) in providerMap" :key="key" :label="label" :value="key" />
        </el-select>
      </div>

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
    <el-dialog v-model="detailVisible" :title="t('orders.detailDialog')" width="560px" destroy-on-close>
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
        <el-button @click="detailVisible = false">{{ t('orders.close') }}</el-button>
      </template>
    </el-dialog>

    <!-- 更新状态 -->
    <el-dialog v-model="statusDialogVisible" :title="t('orders.updateOrderStatusDialog')" width="500px" destroy-on-close>
      <el-form :model="statusForm" label-width="100px">
        <el-form-item :label="t('orders.orderNo')">
          <span>{{ statusForm.orderNo }}</span>
        </el-form-item>
        <el-form-item :label="t('orders.currentStatus')">
          <el-tag :type="statusType(statusForm.currentStatus)" size="small">{{ statusLabel(statusForm.currentStatus) }}</el-tag>
        </el-form-item>
        <el-form-item :label="t('orders.newStatus')">
          <el-select v-model="statusForm.status" style="width: 100%">
            <el-option v-for="(label, key) in statusMap" :key="key" :label="label" :value="key" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('orders.reason')">
          <el-input v-model="statusForm.reason" type="textarea" :rows="3" :placeholder="t('orders.reasonOptional')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="statusDialogVisible = false">{{ t('orders.cancel') }}</el-button>
        <el-button type="primary" :loading="statusSaving" @click="handleStatusSave">{{ t('orders.save') }}</el-button>
      </template>
    </el-dialog>

    <!-- 发票信息 -->
    <el-dialog v-model="invoiceDialogVisible" :title="t('orders.invoiceDialog')" width="500px" destroy-on-close>
      <el-form :model="invoiceForm" label-width="100px">
        <el-form-item :label="t('orders.orderNo')">
          <span>{{ invoiceForm.orderNo }}</span>
        </el-form-item>
        <el-form-item :label="t('orders.isInvoiceRequested')">
          <el-switch v-model="invoiceForm.invoiceRequested" :active-text="t('orders.requested')" :inactive-text="t('orders.notRequested')" />
        </el-form-item>
        <el-form-item :label="t('orders.invoiceNo')">
          <el-input v-model="invoiceForm.invoiceNo" :placeholder="t('orders.invoiceNoOptional')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="invoiceDialogVisible = false">{{ t('orders.cancel') }}</el-button>
        <el-button type="primary" :loading="invoiceSaving" @click="handleInvoiceSave">{{ t('orders.save') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import CmsTable from '@/components/CmsTable.vue';
import client from '@/api/client.js';
import { formatDate } from '@/utils/formatDate.js';

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
