<!--
  Industries View 组件

  位于: views/IndustriesView.vue
-->
<template>
  <div>
    <h2 style="margin-bottom: 20px">{{ t('industries.title') }}</h2>
    <el-card shadow="hover">
      <CmsTable
        api-url="/cms/content/industry"
        :columns="columns"
        :form-fields="formFields"
        :api-params="{ status: 'all' }"
        ai-assist="industry"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import CmsTable from '@/components/ui/CmsTable.vue';

const { t } = useI18n();

const columns = [
  { prop: 'label', label: t('industries.label') },
  { prop: 'slug', label: t('industries.slug') },
  { prop: 'icon', label: t('industries.icon') },
  { prop: 'features', label: t('industries.features'), minWidth: 180, type: 'json' },
  { prop: 'screenshot', label: t('industries.screenshot'), minWidth: 180, type: 'json' },
  { prop: 'isPublished', label: t('industries.isPublished'), width: 100, type: 'switch' },
  { prop: 'sortOrder', label: t('industries.sortOrder'), width: 100 },
];

const formFields = [
  { prop: 'label', label: t('industries.label'), type: 'input' },
  { prop: 'slug', label: t('industries.slug'), type: 'input' },
  { prop: 'icon', label: t('industries.icon'), type: 'input' },
  { prop: 'features', label: t('industries.features'), type: 'textarea', rows: 4, placeholder: t('industries.featuresPlaceholder') },
  { prop: 'screenshot', label: t('industries.screenshot'), type: 'textarea', rows: 3, placeholder: t('industries.screenshotPlaceholder') },
  { prop: 'isPublished', label: t('industries.isPublished'), type: 'switch' },
  { prop: 'sortOrder', label: t('industries.sortOrder'), type: 'number' },
];
</script>
