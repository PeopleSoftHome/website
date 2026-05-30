<template>
  <div>
    <h2 style="margin-bottom: 20px">产品矩阵管理</h2>
    <el-card shadow="hover">
      <CmsTable
        api-url="/cms/products"
        :columns="columns"
        :form-fields="formFields"
      />
    </el-card>
  </div>
</template>

<script setup>
import CmsTable from '@/components/CmsTable.vue';

const columns = [
  { prop: 'name', label: '名称' },
  { prop: 'description', label: '描述', minWidth: 200 },
  { prop: 'icon', label: '图标' },
  { prop: 'tabName', label: 'Tab 分类' },
  { prop: 'isActive', label: '启用', width: 100, type: 'switch' },
  { prop: 'sortOrder', label: '排序', width: 100 },
];

const formFields = [
  { prop: 'name', label: '名称', type: 'input' },
  { prop: 'description', label: '描述', type: 'textarea', rows: 4 },
  { prop: 'icon', label: '图标', type: 'input' },
  { prop: 'tabName', label: 'Tab 分类', type: 'input' },
  { prop: 'isActive', label: '启用', type: 'switch' },
  { prop: 'sortOrder', label: '排序', type: 'number' },
];
</script>
