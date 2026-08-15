<!--
  Job Manager View 组件

  位于: views/JobManagerView.vue
-->
<template>
  <div>
    <h2 style="margin-bottom: 20px">{{ t('jobs.title') }}</h2>
    <el-card shadow="hover">
      <CmsTable
        api-url="/cms/content/jobs"
        :columns="columns"
        :form-fields="formFields"
        ai-assist="job"
      >
        <template #column-status="{ row }">
          <el-tag :type="row.status === 'open' ? 'success' : row.status === 'paused' ? 'warning' : 'info'">
            {{ t(`jobs.statusOptions.${row.status}`, row.status) }}
          </el-tag>
        </template>
        <template #form-field-type="{ form }">
          <el-select v-model="form.type" style="width: 100%">
            <el-option :label="t('jobs.typeOptions.campus')" value="campus" />
            <el-option :label="t('jobs.typeOptions.social')" value="social" />
            <el-option :label="t('jobs.typeOptions.intern')" value="intern" />
          </el-select>
        </template>
        <template #form-field-status="{ form }">
          <el-select v-model="form.status" style="width: 100%">
            <el-option :label="t('jobs.statusOptions.open')" value="open" />
            <el-option :label="t('jobs.statusOptions.closed')" value="closed" />
            <el-option :label="t('jobs.statusOptions.paused')" value="paused" />
          </el-select>
        </template>
      </CmsTable>
    </el-card>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { useI18n } from 'vue-i18n';
import CmsTable from '@/components/ui/CmsTable.vue';

const { t } = useI18n();

const columns = [
  { prop: 'title', label: t('jobs.positionName') },
  { prop: 'department', label: t('jobs.department'), width: 120 },
  { prop: 'location', label: t('jobs.location'), width: 120 },
  { prop: 'type', label: t('jobs.type'), width: 100 },
  { prop: 'experience', label: t('jobs.experience'), width: 120 },
  { prop: 'status', label: t('jobs.status'), width: 100 },
  { prop: 'sortOrder', label: t('jobs.sortOrder'), width: 100 },
];

const formFields = [
  { prop: 'title', label: t('jobs.positionName'), type: 'input' },
  { prop: 'department', label: t('jobs.department'), type: 'input' },
  { prop: 'location', label: t('jobs.location'), type: 'input' },
  { prop: 'type', label: t('jobs.type'), type: 'input' },
  { prop: 'experience', label: t('jobs.experience'), type: 'input' },
  { prop: 'description', label: t('jobs.description'), type: 'textarea', rows: 3 },
  { prop: 'responsibilities', label: t('jobs.responsibilities'), type: 'textarea', rows: 3 },
  { prop: 'requirements', label: t('jobs.requirements'), type: 'textarea', rows: 3 },
  { prop: 'benefits', label: t('jobs.benefits'), type: 'textarea', rows: 3 },
  { prop: 'status', label: t('jobs.status'), type: 'input' },
  { prop: 'sortOrder', label: t('jobs.sortOrder'), type: 'number' },
];
</script>
