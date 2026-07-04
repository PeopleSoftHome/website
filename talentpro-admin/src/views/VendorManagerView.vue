<template>
  <div>
    <h2 style="margin-bottom: 20px">{{ t('vendors.title') }}</h2>
    <el-card shadow="hover">
      <CmsTable
        ref="tableRef"
        api-url="/admin/marketplace/vendors"
        :columns="columns"
        :form-fields="formFields"
      >
        <template #column-revenueShareRate="{ row }">
          <span>{{ row.revenueShareRate != null ? `${(row.revenueShareRate * 100).toFixed(0)}%` : '-' }}</span>
        </template>
        <template #column-isVerified="{ row }">
          <el-tag :type="row.isVerified ? 'success' : 'info'" size="small">
            {{ row.isVerified ? t('vendors.verified') : t('vendors.unverified') }}
          </el-tag>
        </template>
      </CmsTable>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import CmsTable from '@/components/CmsTable.vue';

const { t } = useI18n();

const tableRef = ref(null);

const columns = [
  { prop: 'name', label: t('vendors.name'), minWidth: 160 },
  { prop: 'slug', label: t('vendors.slug'), width: 140 },
  { prop: 'contactEmail', label: t('vendors.contactEmail'), width: 180 },
  { prop: 'website', label: t('vendors.website'), minWidth: 180 },
  { prop: 'revenueShareRate', label: t('vendors.revenueShareRate'), width: 100 },
  { prop: 'isVerified', label: t('vendors.verifiedStatus'), width: 100 },
];

const formFields = [
  { prop: 'name', label: t('vendors.name'), type: 'input' },
  { prop: 'slug', label: t('vendors.slug'), type: 'input' },
  { prop: 'description', label: t('vendors.description'), type: 'textarea', rows: 3 },
  { prop: 'contactEmail', label: t('vendors.contactEmail'), type: 'input' },
  { prop: 'website', label: t('vendors.website'), type: 'input' },
  { prop: 'revenueShareRate', label: t('vendors.revenueShareRate'), type: 'number', placeholder: t('vendors.revenueSharePlaceholder') },
  { prop: 'isVerified', label: t('vendors.isVerified'), type: 'switch' },
];
</script>
