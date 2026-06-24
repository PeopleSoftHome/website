<template>
  <div>
    <h2 style="margin-bottom: 20px">新闻管理</h2>
    <el-card shadow="hover">
      <CmsTable
        api-url="/news"
        :columns="columns"
        :form-fields="formFields"
        ai-assist="news"
      >
        <template #column-status="{ row }">
          <el-tag :type="row.status === 'PUBLISHED' ? 'success' : 'info'">
            {{ row.status === 'PUBLISHED' ? '已发布' : '草稿' }}
          </el-tag>
        </template>
        <template #form-field-category="{ form }">
          <el-select v-model="form.category" style="width: 100%">
            <el-option label="公司动态" value="company" />
            <el-option label="产品更新" value="product" />
            <el-option label="行业活动" value="event" />
          </el-select>
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
  { prop: 'category', label: '分类', width: 120 },
  { prop: 'author', label: '作者', width: 120 },
  { prop: 'featured', label: '精选', width: 100, type: 'switch' },
  { prop: 'status', label: '状态', width: 100 },
  { prop: 'viewCount', label: '浏览量', width: 100 },
]

const formFields = [
  { prop: 'title', label: '标题', type: 'input' },
  { prop: 'slug', label: 'Slug', type: 'input' },
  { prop: 'category', label: '分类', type: 'input' },
  { prop: 'summary', label: '摘要', type: 'textarea', rows: 3 },
  { prop: 'coverImage', label: '封面图', type: 'image-upload' },
  { prop: 'content', label: '内容', type: 'textarea', rows: 4 },
  { prop: 'author', label: '作者', type: 'input' },
  { prop: 'status', label: '状态', type: 'input' },
  { prop: 'featured', label: '精选', type: 'switch' },
]
</script>
