<!--
  Category Manager View 组件

  位于: views/CategoryManagerView.vue
-->
<template>
  <div>
    <h2 style="margin-bottom: 20px">{{ t('categories.title') }}</h2>
    <el-card shadow="hover">
      <CmsTable
        ref="tableRef"
        api-url="/admin/marketplace/categories"
        :columns="columns"
        :form-fields="formFields"
      >
        <template #column-parentId="{ row }">
          <span>{{ row.parent?.name || (row.parentId ? row.parentId : t('categories.topLevel')) }}</span>
        </template>
        <template #column-sortOrder="{ row }">
          <span>{{ row.sortOrder ?? '-' }}</span>
        </template>
        <template #form-field-parentId="{ form }">
          <el-select v-model="form.parentId" clearable :placeholder="t('categories.parentPlaceholder')" style="width: 100%">
            <el-option :label="t('categories.topLevel')" value="" />
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
import { useI18n } from 'vue-i18n';
import CmsTable from '@/components/ui/CmsTable.vue';
import client from '@/api/client';

const { t } = useI18n();

const tableRef = ref(null);
const parentOptions = ref([]);

const columns = [
  { prop: 'name', label: t('categories.name'), minWidth: 160 },
  { prop: 'slug', label: t('categories.slug'), width: 140 },
  { prop: 'parentId', label: t('categories.parent'), width: 140 },
  { prop: 'sortOrder', label: t('categories.sortOrder'), width: 90 },
  { prop: 'description', label: t('categories.description'), minWidth: 200 },
];

const formFields = [
  { prop: 'name', label: t('categories.name'), type: 'input' },
  { prop: 'slug', label: t('categories.slug'), type: 'input' },
  { prop: 'parentId', label: t('categories.parent'), type: 'input' },
  { prop: 'description', label: t('categories.description'), type: 'textarea', rows: 3 },
  { prop: 'sortOrder', label: t('categories.sortOrder'), type: 'number' },
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
