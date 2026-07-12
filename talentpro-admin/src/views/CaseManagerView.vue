<!--
  Case Manager View 组件

  位于: views/CaseManagerView.vue
-->
<template>
  <div>
    <h2 style="margin-bottom: 20px">{{ t('cases.title') }}</h2>
    <el-card shadow="hover">
      <CmsTable
        api-url="/cms/content/case-studies"
        :columns="columns"
        :form-fields="formFields"
        ai-assist="case-study"
      >
        <template #column-status="{ row }">
          <el-tag :type="row.status === 'PUBLISHED' ? 'success' : 'info'">
            {{ t(`cases.statusOptions.${row.status}`, row.status) }}
          </el-tag>
        </template>
        <template #form-field-status="{ form }">
          <el-select v-model="form.status" style="width: 100%">
            <el-option :label="t('cases.statusOptions.DRAFT')" value="DRAFT" />
            <el-option :label="t('cases.statusOptions.PUBLISHED')" value="PUBLISHED" />
          </el-select>
        </template>
      </CmsTable>
    </el-card>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import CmsTable from '@/components/ui/CmsTable.vue';

const { t } = useI18n();

const columns = [
  { prop: 'title', label: t('cases.titleCol') },
  { prop: 'industry', label: t('cases.industry'), width: 120 },
  { prop: 'companyName', label: t('cases.companyName'), width: 150 },
  { prop: 'featured', label: t('cases.featured'), width: 100, type: 'switch' },
  { prop: 'status', label: t('cases.status'), width: 100 },
  { prop: 'sortOrder', label: t('cases.sortOrder'), width: 100 },
];

const formFields = [
  { prop: 'title', label: t('cases.titleCol'), type: 'input' },
  { prop: 'slug', label: t('cases.slug'), type: 'input' },
  { prop: 'industry', label: t('cases.industry'), type: 'input' },
  { prop: 'companyName', label: t('cases.companyName'), type: 'input' },
  { prop: 'excerpt', label: t('cases.excerpt'), type: 'textarea', rows: 3 },
  { prop: 'challenge', label: t('cases.challenge'), type: 'textarea', rows: 4 },
  { prop: 'solution', label: t('cases.solution'), type: 'textarea', rows: 4 },
  { prop: 'results', label: t('cases.results'), type: 'textarea', rows: 4 },
  { prop: 'status', label: t('cases.status'), type: 'input' },
  { prop: 'featured', label: t('cases.featured'), type: 'switch' },
  { prop: 'sortOrder', label: t('cases.sortOrder'), type: 'number' },
];
</script>
