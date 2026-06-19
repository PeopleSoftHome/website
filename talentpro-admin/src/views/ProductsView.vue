<template>
  <div>
    <h2 style="margin-bottom: 20px">产品矩阵管理</h2>
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
import CmsTable from '@/components/CmsTable.vue';

const columns = [
  { prop: 'name', label: '名称' },
  { prop: 'slug', label: 'Slug' },
  { prop: 'description', label: '描述', minWidth: 200 },
  { prop: 'tagline', label: '标语', minWidth: 150 },
  { prop: 'icon', label: '图标' },
  { prop: 'tabId', label: 'Tab ID', minWidth: 220 },
  { prop: 'isPublished', label: '已发布', width: 100, type: 'switch' },
  { prop: 'sortOrder', label: '排序', width: 100 },
];

const formFields = [
  { prop: 'name', label: '名称', type: 'input' },
  { prop: 'slug', label: 'Slug', type: 'input' },
  { prop: 'description', label: '描述', type: 'textarea', rows: 4 },
  { prop: 'tagline', label: '标语', type: 'input' },
  { prop: 'icon', label: '图标', type: 'input' },
  { prop: 'tabId', label: 'Tab ID', type: 'input' },
  { prop: 'isPublished', label: '已发布', type: 'switch' },
  { prop: 'sortOrder', label: '排序', type: 'number' },
];
</script>
