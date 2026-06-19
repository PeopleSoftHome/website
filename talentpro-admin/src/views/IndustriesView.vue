<template>
  <div>
    <h2 style="margin-bottom: 20px">行业方案管理</h2>
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

<script setup>
import CmsTable from '@/components/CmsTable.vue';

const columns = [
  { prop: 'label', label: '名称' },
  { prop: 'slug', label: 'Slug' },
  { prop: 'icon', label: '图标' },
  { prop: 'features', label: '特性', minWidth: 180, type: 'json' },
  { prop: 'screenshot', label: '截图配置', minWidth: 180, type: 'json' },
  { prop: 'isPublished', label: '已发布', width: 100, type: 'switch' },
  { prop: 'sortOrder', label: '排序', width: 100 },
];

const formFields = [
  { prop: 'label', label: '名称', type: 'input' },
  { prop: 'slug', label: 'Slug', type: 'input' },
  { prop: 'icon', label: '图标', type: 'input' },
  { prop: 'features', label: '特性', type: 'textarea', rows: 4, placeholder: '请输入 JSON 数组，例如：[{"badge":"特色一","title":"...","desc":"..."}]' },
  { prop: 'screenshot', label: '截图配置', type: 'textarea', rows: 3, placeholder: '请输入 JSON 对象' },
  { prop: 'isPublished', label: '已发布', type: 'switch' },
  { prop: 'sortOrder', label: '排序', type: 'number' },
];
</script>
