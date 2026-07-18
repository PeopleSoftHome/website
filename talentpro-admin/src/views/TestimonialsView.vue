<!--
  Testimonials View 组件

  位于: views/TestimonialsView.vue
-->
<template>
  <div>
    <h2 style="margin-bottom: 20px">{{ t('testimonials.title') }}</h2>
    <el-card shadow="hover">
      <CmsTable
        api-url="/cms/content/testimonial"
        :columns="columns"
        :form-fields="formFields"
        :api-params="{ status: 'all' }"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import CmsTable from '@/components/ui/CmsTable.vue';

const { t } = useI18n();

const columns = [
  { prop: 'name', label: t('testimonials.name') },
  { prop: 'title', label: t('testimonials.titleCol') },
  { prop: 'text', label: t('testimonials.text'), minWidth: 200 },
  { prop: 'industry', label: t('testimonials.industry') },
  { prop: 'product', label: t('testimonials.product') },
  { prop: 'isActive', label: t('testimonials.isActive'), width: 100, type: 'switch' },
  { prop: 'sortOrder', label: t('testimonials.sortOrder'), width: 100 },
];

const formFields = [
  { prop: 'name', label: t('testimonials.name'), type: 'input' },
  { prop: 'title', label: t('testimonials.titleCol'), type: 'input' },
  { prop: 'text', label: t('testimonials.text'), type: 'textarea', rows: 4 },
  { prop: 'industry', label: t('testimonials.industry'), type: 'input' },
  { prop: 'product', label: t('testimonials.product'), type: 'input' },
  { prop: 'isActive', label: t('testimonials.isActive'), type: 'switch' },
  { prop: 'sortOrder', label: t('testimonials.sortOrder'), type: 'number' },
];
</script>
