<!--
  News Manager View 组件

  位于: views/NewsManagerView.vue
-->
<template>
  <div>
    <h2 style="margin-bottom: 20px">{{ t('news.title') }}</h2>
    <el-card shadow="hover">
      <CmsTable
        api-url="/news"
        :columns="columns"
        :form-fields="formFields"
        ai-assist="news"
      >
        <template #column-status="{ row }">
          <el-tag :type="row.status === 'PUBLISHED' ? 'success' : 'info'">
            {{ t(`news.statusOptions.${row.status}`, row.status) }}
          </el-tag>
        </template>
        <template #form-field-category="{ form }">
          <el-select v-model="form.category" style="width: 100%">
            <el-option :label="t('news.categoryOptions.company')" value="company" />
            <el-option :label="t('news.categoryOptions.product')" value="product" />
            <el-option :label="t('news.categoryOptions.event')" value="event" />
          </el-select>
        </template>
        <template #form-field-status="{ form }">
          <el-select v-model="form.status" style="width: 100%">
            <el-option :label="t('news.statusOptions.DRAFT')" value="DRAFT" />
            <el-option :label="t('news.statusOptions.PUBLISHED')" value="PUBLISHED" />
          </el-select>
        </template>
      </CmsTable>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import CmsTable from '@/components/ui/CmsTable.vue';

const { t } = useI18n();

const columns = [
  { prop: 'title', label: t('news.titleCol') },
  { prop: 'category', label: t('news.category'), width: 120 },
  { prop: 'author', label: t('news.author'), width: 120 },
  { prop: 'featured', label: t('news.featured'), width: 100, type: 'switch' },
  { prop: 'status', label: t('news.status'), width: 100 },
  { prop: 'viewCount', label: t('news.viewCount'), width: 100 },
];

const formFields = [
  { prop: 'title', label: t('news.titleCol'), type: 'input' },
  { prop: 'slug', label: t('news.slug'), type: 'input' },
  { prop: 'category', label: t('news.category'), type: 'input' },
  { prop: 'summary', label: t('news.summary'), type: 'textarea', rows: 3 },
  { prop: 'coverImage', label: t('news.coverImage'), type: 'image-upload' },
  { prop: 'content', label: t('news.content'), type: 'textarea', rows: 4 },
  { prop: 'author', label: t('news.author'), type: 'input' },
  { prop: 'status', label: t('news.status'), type: 'input' },
  { prop: 'featured', label: t('news.featured'), type: 'switch' },
];
</script>
