<template>
  <div>
    <h2 style="margin-bottom: 20px">应用分类管理</h2>
    <el-card shadow="hover">
      <CmsTable
        ref="tableRef"
        api-url="/admin/marketplace/categories"
        :columns="columns"
        :form-fields="formFields"
      >
        <template #column-parentId="{ row }">
          <span>{{ row.parent?.name || (row.parentId ? row.parentId : '顶级分类') }}</span>
        </template>
        <template #column-sortOrder="{ row }">
          <span>{{ row.sortOrder ?? '-' }}</span>
        </template>
        <template #form-field-parentId="{ form }">
          <el-select v-model="form.parentId" clearable placeholder="选择父分类（留空为顶级）" style="width: 100%">
            <el-option label="顶级分类" value="" />
            <el-option
              v-for="cat in parentOptions"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            />
          </el-select>
        </template>
      </CmsTable>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import CmsTable from '@/components/CmsTable.vue';
import client from '@/api/client.js';

const tableRef = ref(null);
const parentOptions = ref([]);

const columns = [
  { prop: 'name', label: '分类名称', minWidth: 160 },
  { prop: 'slug', label: 'Slug', width: 140 },
  { prop: 'parentId', label: '父分类', width: 140 },
  { prop: 'sortOrder', label: '排序', width: 90 },
  { prop: 'description', label: '描述', minWidth: 200 },
];

const formFields = [
  { prop: 'name', label: '分类名称', type: 'input' },
  { prop: 'slug', label: 'Slug', type: 'input' },
  { prop: 'parentId', label: '父分类', type: 'input' },
  { prop: 'description', label: '描述', type: 'textarea', rows: 3 },
  { prop: 'sortOrder', label: '排序', type: 'number' },
];

onMounted(async () => {
  try {
    const res = await client.get('/marketplace/categories');
    parentOptions.value = (res.data || []).map((c) => ({ id: c.id, name: c.name }));
  } catch {
    // ignore
  }
});
</script>
