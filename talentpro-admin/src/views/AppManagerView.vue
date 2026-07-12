<!--
  App Manager View 组件

  位于: views/AppManagerView.vue
-->
<template>
  <div>
    <h2 style="margin-bottom: 20px">{{ t('apps.title') }}</h2>
    <el-card shadow="hover">
      <div style="margin-bottom: 16px; display: flex; gap: 12px; flex-wrap: wrap">
        <el-select v-model="filterStatus" :placeholder="t('apps.allStatus')" clearable style="width: 140px" @change="handleFilterChange">
          <el-option v-for="(label, key) in statusMap" :key="key" :label="label" :value="key" />
        </el-select>
        <el-select v-model="filterCategory" :placeholder="t('apps.allCategories')" clearable style="width: 140px" @change="handleFilterChange">
          <el-option v-for="c in categories" :key="c.id" :label="c.label" :value="c.id" />
        </el-select>
      </div>

      <CmsTable
        ref="tableRef"
        api-url="/admin/marketplace/apps"
        :columns="columns"
        :form-fields="formFields"
        :api-params="apiParams"
        ai-assist="product"
      >
        <template #column-status="{ row }">
          <el-tag :type="statusType(row.status)">
            {{ statusLabel(row.status) }}
          </el-tag>
        </template>
        <template #column-pricingModel="{ row }">
          <el-tag size="small">{{ pricingLabel(row.pricingModel) }}</el-tag>
        </template>
        <template #column-featured="{ row }">
          <el-tag :type="row.featured ? 'success' : 'info'" size="small">
            {{ row.featured ? t('cmsTable.yes') : t('cmsTable.no') }}
          </el-tag>
        </template>
        <template #column-ratingAvg="{ row }">
          <span style="color: var(--admin-color-warning); font-weight: 600">★ {{ row.ratingAvg || '-' }}</span>
        </template>
        <template #actions="{ row }">
          <el-button link type="primary" @click="openStatusDialog(row)">{{ t('apps.review') }}</el-button>
          <el-button link :type="row.featured ? 'warning' : 'success'" @click="toggleFeature(row)">
            {{ row.featured ? t('apps.unsetFeature') : t('apps.setFeature') }}
          </el-button>
        </template>
        <template #form-field-status="{ form }">
          <el-select v-model="form.status" style="width: 100%">
            <el-option v-for="(label, key) in statusMap" :key="key" :label="label" :value="key" />
          </el-select>
        </template>
        <template #form-field-pricingModel="{ form }">
          <el-select v-model="form.pricingModel" style="width: 100%">
            <el-option v-for="(label, key) in pricingMap" :key="key" :label="label" :value="key" />
          </el-select>
        </template>
        <template #form-field-featured="{ form }">
          <el-switch v-model="form.featured" />
        </template>
      </CmsTable>
    </el-card>

    <!-- 审核弹窗 -->
    <el-dialog v-model="statusDialogVisible" :title="t('apps.reviewDialog')" width="500px" destroy-on-close>
      <el-form :model="statusForm" label-width="100px">
        <el-form-item :label="t('apps.appName')">
          <span>{{ statusForm.name }}</span>
        </el-form-item>
        <el-form-item :label="t('apps.currentStatus')">
          <el-tag :type="statusType(statusForm.currentStatus)">{{ statusLabel(statusForm.currentStatus) }}</el-tag>
        </el-form-item>
        <el-form-item :label="t('apps.newStatus')">
          <el-select v-model="statusForm.status" style="width: 100%">
            <el-option v-for="(label, key) in statusMap" :key="key" :label="label" :value="key" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="statusDialogVisible = false">{{ t('apps.cancel') }}</el-button>
        <el-button type="primary" :loading="statusSaving" @click="handleStatusSave">{{ t('apps.save') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import CmsTable from '@/components/ui/CmsTable.vue';
import client from '@/api/client.js';

const { t } = useI18n();

const tableRef = ref(null);
const filterStatus = ref('');
const filterCategory = ref('');

const apiParams = ref({});

const statusMap = computed(() => ({
  DRAFT: t('apps.statusOptions.DRAFT'),
  PENDING_REVIEW: t('apps.statusOptions.PENDING_REVIEW'),
  APPROVED: t('apps.statusOptions.APPROVED'),
  PUBLISHED: t('apps.statusOptions.PUBLISHED'),
  REJECTED: t('apps.statusOptions.REJECTED'),
  SUSPENDED: t('apps.statusOptions.SUSPENDED'),
  DEPRECATED: t('apps.statusOptions.DEPRECATED'),
}));

const pricingMap = computed(() => ({
  FREE: t('apps.pricingOptions.FREE'),
  ONE_TIME: t('apps.pricingOptions.ONE_TIME'),
  SUBSCRIPTION: t('apps.pricingOptions.SUBSCRIPTION'),
  USAGE_BASED: t('apps.pricingOptions.USAGE_BASED'),
  FREEMIUM: t('apps.pricingOptions.FREEMIUM'),
}));

const categories = computed(() => [
  { id: 'recruitment', label: t('apps.categories.recruitment') },
  { id: 'compensation', label: t('apps.categories.compensation') },
  { id: 'performance', label: t('apps.categories.performance') },
  { id: 'learning', label: t('apps.categories.learning') },
  { id: 'experience', label: t('apps.categories.experience') },
  { id: 'compliance', label: t('apps.categories.compliance') },
  { id: 'ai', label: t('apps.categories.ai') },
  { id: 'analytics', label: t('apps.categories.analytics') },
]);

const columns = [
  { prop: 'name', label: t('apps.name'), minWidth: 160 },
  { prop: 'slug', label: t('apps.slug'), width: 140 },
  { prop: 'category', label: t('apps.category'), width: 120, formatter: (row) => categoryLabel(row.category?.slug || row.category) },
  { prop: 'vendor', label: t('apps.vendor'), width: 120, formatter: (row) => row.vendor?.name || row.vendor },
  { prop: 'pricingModel', label: t('apps.pricing'), width: 90 },
  { prop: 'status', label: t('apps.status'), width: 90 },
  { prop: 'featured', label: t('apps.featured'), width: 80 },
  { prop: 'ratingAvg', label: t('apps.rating'), width: 80 },
  { prop: 'installCount', label: t('apps.installCount'), width: 90 },
  { prop: 'sortOrder', label: t('apps.sortOrder'), width: 80 },
];

const formFields = [
  { prop: 'name', label: t('apps.name'), type: 'input' },
  { prop: 'slug', label: t('apps.slug'), type: 'input' },
  { prop: 'tagline', label: t('apps.tagline'), type: 'input' },
  { prop: 'description', label: t('apps.description'), type: 'textarea', rows: 4 },
  { prop: 'status', label: t('apps.status'), type: 'input' },
  { prop: 'pricingModel', label: t('apps.pricingModel'), type: 'input' },
  { prop: 'featured', label: t('apps.featured'), type: 'switch' },
  { prop: 'sortOrder', label: t('apps.sortOrder'), type: 'number' },
];

const statusDialogVisible = ref(false);
const statusSaving = ref(false);
const statusForm = ref({ id: '', name: '', currentStatus: '', status: '' });

const statusType = (s) => {
  const map = {
    DRAFT: 'info',
    PENDING_REVIEW: 'warning',
    APPROVED: 'success',
    PUBLISHED: 'success',
    REJECTED: 'danger',
    SUSPENDED: 'danger',
    DEPRECATED: 'info',
  };
  return map[s] || 'info';
};

const statusLabel = (s) => statusMap.value[s] || s;
const pricingLabel = (p) => pricingMap.value[p] || p;

const categoryLabel = (c) => {
  const cat = categories.value.find((x) => x.id === c);
  return cat?.label || c;
};

const handleFilterChange = () => {
  apiParams.value = {};
  if (filterStatus.value) apiParams.value.status = filterStatus.value;
  if (filterCategory.value) apiParams.value.category = filterCategory.value;
  if (tableRef.value) {
    tableRef.value.setParams(apiParams.value);
    tableRef.value.refresh();
  }
};

const openStatusDialog = (row) => {
  statusForm.value = {
    id: row.id,
    name: row.name,
    currentStatus: row.status,
    status: row.status,
  };
  statusDialogVisible.value = true;
};

const handleStatusSave = async () => {
  statusSaving.value = true;
  try {
    await client.patch(`/admin/marketplace/apps/${statusForm.value.id}/status`, {
      status: statusForm.value.status,
    });
    ElMessage.success(t('apps.statusUpdateSuccess'));
    statusDialogVisible.value = false;
    if (tableRef.value) tableRef.value.refresh();
  } catch (e) {
    ElMessage.error(e.response?.data?.message || t('apps.updateFailed'));
  } finally {
    statusSaving.value = false;
  }
};

const toggleFeature = async (row) => {
  try {
    await client.post(`/admin/marketplace/apps/${row.id}/feature`, {
      featured: !row.featured,
    });
    ElMessage.success(!row.featured ? t('apps.setFeature') : t('apps.unsetFeature'));
    if (tableRef.value) tableRef.value.refresh();
  } catch (e) {
    ElMessage.error(e.response?.data?.message || t('apps.operationFailed'));
  }
};
</script>
