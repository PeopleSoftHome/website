<template>
  <div>
    <h2 style="margin-bottom: 20px">招聘管理</h2>
    <el-card shadow="hover">
      <CmsTable
        api-url="/jobs"
        :columns="columns"
        :form-fields="formFields"
        ai-assist="job"
      >
        <template #column-status="{ row }">
          <el-tag :type="row.status === 'open' ? 'success' : row.status === 'paused' ? 'warning' : 'info'">
            {{ row.status === 'open' ? '开放' : row.status === 'paused' ? '暂停' : '已关闭' }}
          </el-tag>
        </template>
        <template #form-field-type="{ form }">
          <el-select v-model="form.type" style="width: 100%">
            <el-option label="校园招聘" value="campus" />
            <el-option label="社会招聘" value="social" />
            <el-option label="实习生" value="intern" />
          </el-select>
        </template>
        <template #form-field-status="{ form }">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="开放" value="open" />
            <el-option label="已关闭" value="closed" />
            <el-option label="暂停" value="paused" />
          </el-select>
        </template>
      </CmsTable>
    </el-card>
  </div>
</template>

<script setup>
import CmsTable from '@/components/CmsTable.vue'

const columns = [
  { prop: 'title', label: '职位名称' },
  { prop: 'department', label: '部门', width: 120 },
  { prop: 'location', label: '地点', width: 120 },
  { prop: 'type', label: '类型', width: 100 },
  { prop: 'experience', label: '经验要求', width: 120 },
  { prop: 'status', label: '状态', width: 100 },
  { prop: 'sortOrder', label: '排序', width: 100 },
]

const formFields = [
  { prop: 'title', label: '职位名称', type: 'input' },
  { prop: 'department', label: '部门', type: 'input' },
  { prop: 'location', label: '地点', type: 'input' },
  { prop: 'type', label: '类型', type: 'input' },
  { prop: 'experience', label: '经验要求', type: 'input' },
  { prop: 'description', label: '职位描述', type: 'textarea', rows: 3 },
  { prop: 'requirements', label: '任职要求', type: 'textarea', rows: 3 },
  { prop: 'status', label: '状态', type: 'input' },
  { prop: 'sortOrder', label: '排序', type: 'number' },
]
</script>
