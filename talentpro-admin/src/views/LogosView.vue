<template>
  <div>
    <h2 style="margin-bottom: 20px">Logo 墙管理</h2>
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
import CmsTable from '@/components/CmsTable.vue';

const columns = [
  { prop: 'name', label: '名称' },
  { prop: 'logo', label: 'Logo 地址', minWidth: 200 },
  { prop: 'industry', label: '行业' },
  { prop: 'isActive', label: '启用', width: 100, type: 'switch' },
  { prop: 'sortOrder', label: '排序', width: 100 },
];

const formFields = [
  { prop: 'name', label: '名称', type: 'input' },
  { prop: 'logo', label: 'Logo 图片', type: 'image-upload' },
  { prop: 'industry', label: '行业', type: 'input' },
  { prop: 'isActive', label: '启用', type: 'switch' },
  { prop: 'sortOrder', label: '排序', type: 'number' },
];
</script>
