<!--
  Subscription Manager View 组件

  位于: views/SubscriptionManagerView.vue
-->
<template>
  <div>
    <h2 style="margin-bottom: 20px">{{ t('subscriptions.title') }}</h2>
    <el-card shadow="hover">
      <div style="margin-bottom: 16px; display: flex; gap: 12px; flex-wrap: wrap">
        <el-select v-model="filterStatus" :placeholder="t('subscriptions.allStatus')" clearable style="width: 140px" @change="handleFilterChange">
          <el-option v-for="(label, key) in statusMap" :key="key" :label="label" :value="key" />
        </el-select>
      </div>

      <CmsTable
        ref="tableRef"
        api-url="/admin/marketplace/subscriptions"
        :columns="columns"
        :form-fields="formFields"
        :api-params="apiParams"
      >
        <template #column-appName="{ row }">
          <span>{{ row.app?.name || row.appName || '-' }}</span>
        </template>
        <template #column-status="{ row }">
          <el-tag :type="statusType(row.status)" size="small">
            {{ statusLabel(row.status) }}
          </el-tag>
        </template>
        <template #column-pricingModel="{ row }">
          <el-tag size="small">{{ pricingLabel(row.pricingModel) }}</el-tag>
        </template>
        <template #column-amount="{ row }">
          <span>¥ {{ row.amount }}</span>
        </template>
        <template #column-trialEndsAt="{ row }">
          <span>{{ formatDate(row.trialEndsAt) }}</span>
        </template>
        <template #column-currentPeriodEnd="{ row }">
          <span>{{ formatDate(row.currentPeriodEnd) }}</span>
        </template>
        <template #column-createdAt="{ row }">
          <span>{{ formatDate(row.createdAt) }}</span>
        </template>
        <template #actions="{ row }">
          <el-button link type="primary" @click="openDetailDialog(row)">{{ t('subscriptions.view') }}</el-button>
          <el-button link type="warning" @click="openStatusDialog(row)">{{ t('subscriptions.updateStatus') }}</el-button>
        </template>
      </CmsTable>
    </el-card>

    <!-- 订阅详情 -->
    <el-dialog v-model="detailVisible" :title="t('subscriptions.detailDialog')" width="560px" destroy-on-close>
      <el-descriptions :column="2" border size="small">
        <el-descriptions-item :label="t('subscriptions.id')" :span="2">{{ detail.id }}</el-descriptions-item>
        <el-descriptions-item :label="t('subscriptions.appName')">{{ detail.appName }}</el-descriptions-item>
        <el-descriptions-item :label="t('subscriptions.workspaceId')">{{ detail.workspaceId }}</el-descriptions-item>
        <el-descriptions-item :label="t('subscriptions.tierName')">{{ detail.tierName }}</el-descriptions-item>
        <el-descriptions-item :label="t('subscriptions.pricingModel')">{{ pricingLabel(detail.pricingModel) }}</el-descriptions-item>
        <el-descriptions-item :label="t('subscriptions.amount')">¥ {{ detail.amount }}</el-descriptions-item>
        <el-descriptions-item :label="t('subscriptions.interval')">{{ detail.interval }}</el-descriptions-item>
        <el-descriptions-item :label="t('subscriptions.status')">
          <el-tag :type="statusType(detail.status)" size="small">{{ statusLabel(detail.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="t('subscriptions.trialEndsAt')">{{ formatDate(detail.trialEndsAt) }}</el-descriptions-item>
        <el-descriptions-item :label="t('subscriptions.currentPeriodEnd')">{{ formatDate(detail.currentPeriodEnd) }}</el-descriptions-item>
        <el-descriptions-item :label="t('subscriptions.createdAt')">{{ formatDate(detail.createdAt) }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">{{ t('common.close') }}</el-button>
      </template>
    </el-dialog>

    <!-- 更新状态 -->
    <el-dialog v-model="statusDialogVisible" :title="t('subscriptions.updateStatus')" width="500px" destroy-on-close>
      <el-form :model="statusForm" label-width="100px">
        <el-form-item :label="t('subscriptions.id')">
          <span>{{ statusForm.id }}</span>
        </el-form-item>
        <el-form-item :label="t('subscriptions.appName')">
          <span>{{ statusForm.appName }}</span>
        </el-form-item>
        <el-form-item :label="t('subscriptions.currentStatus')">
          <el-tag :type="statusType(statusForm.currentStatus)" size="small">{{ statusLabel(statusForm.currentStatus) }}</el-tag>
        </el-form-item>
        <el-form-item :label="t('subscriptions.newStatus')">
          <el-select v-model="statusForm.status" style="width: 100%">
            <el-option v-for="(label, key) in statusMap" :key="key" :label="label" :value="key" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="statusDialogVisible = false">{{ t('subscriptions.cancel') }}</el-button>
        <el-button type="primary" :loading="statusSaving" @click="handleStatusSave">{{ t('subscriptions.save') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import CmsTable from '@/components/ui/CmsTable.vue';
import client from '@/api/client';
import { formatDate } from '@/utils/formatDate';

const { t } = useI18n();

const tableRef = ref(null);
const filterStatus = ref('');
const apiParams = ref({});

const statusMap = computed(() => ({
  TRIAL: t('subscriptions.statusOptions.TRIAL'),
  ACTIVE: t('subscriptions.statusOptions.ACTIVE'),
  EXPIRED: t('subscriptions.statusOptions.EXPIRED'),
  CANCELLED: t('subscriptions.statusOptions.CANCELLED'),
  PAST_DUE: t('subscriptions.statusOptions.PAST_DUE'),
}));

const pricingMap = computed(() => ({
  FREE: t('apps.pricingOptions.FREE'),
  ONE_TIME: t('apps.pricingOptions.ONE_TIME'),
  SUBSCRIPTION: t('apps.pricingOptions.SUBSCRIPTION'),
  USAGE_BASED: t('apps.pricingOptions.USAGE_BASED'),
  FREEMIUM: t('apps.pricingOptions.FREEMIUM'),
}));

const columns = [
  { prop: 'id', label: t('subscriptions.id'), minWidth: 200 },
  { prop: 'appName', label: t('subscriptions.appName'), minWidth: 160 },
  { prop: 'workspaceId', label: t('subscriptions.workspaceId'), width: 180 },
  { prop: 'tierName', label: t('subscriptions.tierName'), width: 120 },
  { prop: 'pricingModel', label: t('subscriptions.pricingModel'), width: 100 },
  { prop: 'amount', label: t('subscriptions.amount'), width: 100 },
  { prop: 'interval', label: t('subscriptions.interval'), width: 90 },
  { prop: 'status', label: t('subscriptions.status'), width: 100 },
  { prop: 'trialEndsAt', label: t('subscriptions.trialEndsAt'), width: 160 },
  { prop: 'currentPeriodEnd', label: t('subscriptions.currentPeriodEnd'), width: 160 },
  { prop: 'createdAt', label: t('subscriptions.createdAt'), width: 160 },
];

const formFields = [
  { prop: 'id', label: t('subscriptions.id'), type: 'input' },
  { prop: 'appName', label: t('subscriptions.appName'), type: 'input' },
  { prop: 'workspaceId', label: t('subscriptions.workspaceId'), type: 'input' },
  { prop: 'tierName', label: t('subscriptions.tierName'), type: 'input' },
  { prop: 'status', label: t('subscriptions.status'), type: 'input' },
];

const statusType = (s) => {
  const map = {
    TRIAL: 'warning',
    ACTIVE: 'success',
    PAST_DUE: 'danger',
    CANCELLED: 'info',
    EXPIRED: 'info',
  };
  return map[s] || 'info';
};

const statusLabel = (s) => statusMap.value[s] || s;
const pricingLabel = (p) => pricingMap.value[p] || p;

const handleFilterChange = () => {
  apiParams.value = {};
  if (filterStatus.value) apiParams.value.status = filterStatus.value;
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
    id: row.id,
    appName: row.app?.name || row.appName || '-',
    workspaceId: row.workspaceId,
    tierName: row.tierName,
    pricingModel: row.pricingModel,
    amount: row.amount,
    interval: row.interval,
    status: row.status,
    trialEndsAt: row.trialEndsAt,
    currentPeriodEnd: row.currentPeriodEnd,
    createdAt: row.createdAt,
  };
  detailVisible.value = true;
};

// 状态弹窗
const statusDialogVisible = ref(false);
const statusSaving = ref(false);
const statusForm = ref({ id: '', appName: '', currentStatus: '', status: '' });

const openStatusDialog = (row) => {
  statusForm.value = {
    id: row.id,
    appName: row.app?.name || row.appName || '-',
    currentStatus: row.status,
    status: row.status,
  };
  statusDialogVisible.value = true;
};

const handleStatusSave = async () => {
  statusSaving.value = true;
  try {
    await client.patch(`/admin/marketplace/subscriptions/${statusForm.value.id}/status`, {
      status: statusForm.value.status,
    });
    ElMessage.success(t('subscriptions.statusUpdateSuccess'));
    statusDialogVisible.value = false;
    if (tableRef.value) tableRef.value.refresh();
  } catch (e) {
    ElMessage.error(e.response?.data?.message || t('subscriptions.updateFailed'));
  } finally {
    statusSaving.value = false;
  }
};
</script>
