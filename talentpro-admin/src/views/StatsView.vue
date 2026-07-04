<template>
  <div>
    <h2 style="margin-bottom: 20px">{{ t('stats.title') }}</h2>
    <el-card shadow="hover">
      <CmsTable
        api-url="/cms/content/stat"
        :columns="columns"
        :form-fields="formFields"
        :api-params="{ status: 'all' }"
      />
    </el-card>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import CmsTable from '@/components/CmsTable.vue';

const { t } = useI18n();

const columns = [
  { prop: 'key', label: t('stats.key') },
  { prop: 'label', label: t('stats.label') },
  { prop: 'value', label: t('stats.value') },
  { prop: 'suffix', label: t('stats.suffix') },
  { prop: 'prefix', label: t('stats.prefix') },
  { prop: 'isActive', label: t('stats.isActive'), width: 100, type: 'switch' },
  { prop: 'sortOrder', label: t('stats.sortOrder'), width: 100 },
];

const formFields = [
  { prop: 'key', label: t('stats.key'), type: 'input' },
  { prop: 'label', label: t('stats.label'), type: 'input' },
  { prop: 'value', label: t('stats.value'), type: 'input' },
  { prop: 'suffix', label: t('stats.suffix'), type: 'input' },
  { prop: 'prefix', label: t('stats.prefix'), type: 'input' },
  { prop: 'isActive', label: t('stats.isActive'), type: 'switch' },
  { prop: 'sortOrder', label: t('stats.sortOrder'), type: 'number' },
];
</script>
