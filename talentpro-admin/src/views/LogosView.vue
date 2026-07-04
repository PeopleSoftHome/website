<template>
  <div>
    <h2 style="margin-bottom: 20px">{{ t('logos.title') }}</h2>
    <el-card shadow="hover">
      <CmsTable
        api-url="/cms/content/clientLogo"
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
  { prop: 'name', label: t('logos.name') },
  { prop: 'logo', label: t('logos.logo'), minWidth: 200 },
  { prop: 'industry', label: t('logos.industry') },
  { prop: 'isActive', label: t('logos.isActive'), width: 100, type: 'switch' },
  { prop: 'sortOrder', label: t('logos.sortOrder'), width: 100 },
];

const formFields = [
  { prop: 'name', label: t('logos.name'), type: 'input' },
  { prop: 'logo', label: t('logos.logoImage'), type: 'image-upload' },
  { prop: 'industry', label: t('logos.industry'), type: 'input' },
  { prop: 'isActive', label: t('logos.isActive'), type: 'switch' },
  { prop: 'sortOrder', label: t('logos.sortOrder'), type: 'number' },
];
</script>
