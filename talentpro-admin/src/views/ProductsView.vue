<!--
  Products View 组件

  位于: views/ProductsView.vue
-->
<template>
  <div>
    <h2 style="margin-bottom: 20px">{{ t('products.title') }}</h2>
    <el-card shadow="hover">
      <CmsTable
        api-url="/cms/content/product"
        :columns="columns"
        :form-fields="formFields"
        :api-params="{ status: 'all' }"
        ai-assist="product"
      />
    </el-card>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import CmsTable from '@/components/ui/CmsTable.vue';

const { t } = useI18n();

const columns = [
  { prop: 'name', label: t('products.name') },
  { prop: 'slug', label: t('products.slug') },
  { prop: 'description', label: t('products.description'), minWidth: 200 },
  { prop: 'tagline', label: t('products.tagline'), minWidth: 150 },
  { prop: 'icon', label: t('products.icon') },
  { prop: 'tabId', label: t('products.tabId'), minWidth: 220 },
  { prop: 'isPublished', label: t('products.isPublished'), width: 100, type: 'switch' },
  { prop: 'sortOrder', label: t('products.sortOrder'), width: 100 },
];

const formFields = [
  { prop: 'name', label: t('products.name'), type: 'input' },
  { prop: 'slug', label: t('products.slug'), type: 'input' },
  { prop: 'description', label: t('products.description'), type: 'textarea', rows: 4 },
  { prop: 'tagline', label: t('products.tagline'), type: 'input' },
  { prop: 'icon', label: t('products.icon'), type: 'input' },
  { prop: 'tabId', label: t('products.tabId'), type: 'input' },
  { prop: 'isPublished', label: t('products.isPublished'), type: 'switch' },
  { prop: 'sortOrder', label: t('products.sortOrder'), type: 'number' },
];
</script>
