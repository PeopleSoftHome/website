<template>
  <div>
    <h2 style="margin-bottom: 20px">客户案例管理</h2>
    <el-card shadow="hover">
      <CmsTable
        api-url="/case-studies"
        :columns="columns"
        :form-fields="formFields"
      >
        <template #column-status="{ row }">
          <el-tag :type="row.status === 'PUBLISHED' ? 'success' : 'info'">
            {{ row.status === 'PUBLISHED' ? '已发布' : '草稿' }}
          </el-tag>
        </template>
        <template #form-field-status="{ form }">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="草稿" value="DRAFT" />
            <el-option label="已发布" value="PUBLISHED" />
          </el-select>
        </template>
      </CmsTable>
    </el-card>
  </div>
</template>

<script setup>
import CmsTable from '@/components/CmsTable.vue'

const columns = [
  { prop: 'title', label: '标题' },
  { prop: 'industry', label: '行业', width: 120 },
  { prop: 'companyName', label: '客户公司', width: 150 },
  { prop: 'featured', label: '精选', width: 100, type: 'switch' },
  { prop: 'status', label: '状态', width: 100 },
  { prop: 'sortOrder', label: '排序', width: 100 },
]

const formFields = [
  { prop: 'title', label: '标题', type: 'input' },
  { prop: 'slug', label: 'Slug', type: 'input' },
  { prop: 'industry', label: '行业', type: 'input' },
  { prop: 'companyName', label: '客户公司', type: 'input' },
  { prop: 'excerpt', label: '摘要', type: 'textarea', rows: 3 },
  { prop: 'status', label: '状态', type: 'input' },
  { prop: 'featured', label: '精选', type: 'switch' },
  { prop: 'sortOrder', label: '排序', type: 'number' },
]
</script>
