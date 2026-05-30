<template>
  <div>
    <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center">
      <div>
        <el-button type="primary" @click="openDialog()">+ 新建</el-button>
        <el-button
          v-if="selection"
          type="danger"
          :disabled="!selectedRows.length"
          @click="handleBatchDelete"
          style="margin-left: 12px"
        >
          批量删除 ({{ selectedRows.length }})
        </el-button>
      </div>
    </div>

    <el-table
      :data="items"
      v-loading="loading"
      size="default"
      @selection-change="handleSelectionChange"
    >
      <el-table-column v-if="selection" type="selection" width="55" />

      <el-table-column
        v-for="col in columns"
        :key="col.prop"
        :prop="col.prop"
        :label="col.label"
        :width="col.width"
        :min-width="col.minWidth"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          <!-- 自定义列插槽 -->
          <slot :name="`column-${col.prop}`" :row="row">
            <!-- 内置类型渲染 -->
            <template v-if="col.type === 'switch'">
              <el-tag :type="row[col.prop] ? 'success' : 'info'">
                {{ row[col.prop] ? '是' : '否' }}
              </el-tag>
            </template>
            <template v-else-if="col.type === 'json'">
              <el-tooltip placement="top">
                <template #content>
                  <pre style="max-width: 400px; white-space: pre-wrap; word-break: break-all; margin: 0">{{ formatJson(row[col.prop]) }}</pre>
                </template>
                <span class="json-preview">{{ formatJson(row[col.prop]) }}</span>
              </el-tooltip>
            </template>
            <template v-else-if="col.formatter">
              {{ col.formatter(row, col, row[col.prop]) }}
            </template>
            <template v-else>
              {{ row[col.prop] }}
            </template>
          </slot>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <slot name="actions" :row="row">
            <el-button link type="primary" @click="openDialog(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </slot>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      style="margin-top: 16px; justify-content: flex-end"
      layout="prev, pager, next"
      :total="total"
      :page-size="pageSize"
      v-model:current-page="page"
    />

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑' : '新建'" width="600px" destroy-on-close>
      <el-form :model="form" label-width="100px" :rules="rules" ref="formRef">
        <el-form-item
          v-for="field in formFields"
          :key="field.prop"
          :label="field.label"
          :prop="field.prop"
        >
          <slot :name="`form-field-${field.prop}`" :field="field" :form="form">
            <el-input
              v-if="field.type === 'input'"
              v-model="form[field.prop]"
              :placeholder="field.placeholder"
            />
            <el-input
              v-else-if="field.type === 'textarea'"
              v-model="form[field.prop]"
              type="textarea"
              :rows="field.rows || 3"
              :placeholder="field.placeholder"
            />
            <el-switch
              v-else-if="field.type === 'switch'"
              v-model="form[field.prop]"
            />
            <el-input-number
              v-else-if="field.type === 'number'"
              v-model="form[field.prop]"
              :min="field.min ?? 0"
              style="width: 100%"
            />
            <ImageUpload
              v-else-if="field.type === 'image-upload'"
              v-model="form[field.prop]"
            />
          </slot>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import client from '@/api/client.js';
import ImageUpload from './ImageUpload.vue';
import { useCrud } from '@/composables/useCrud.js';

const props = defineProps({
  apiUrl: { type: String, required: true },
  columns: { type: Array, required: true },
  formFields: { type: Array, required: true },
  responseAdapter: { type: Function, default: null },
  rules: { type: Object, default: () => ({}) },
  selection: { type: Boolean, default: false },
  pageSize: { type: Number, default: 20 },
  apiParams: { type: Object, default: () => ({}) },
});

const buildEmptyForm = () => {
  const obj = {};
  props.formFields.forEach((f) => {
    if (f.type === 'switch') obj[f.prop] = true;
    else if (f.type === 'number') obj[f.prop] = 0;
    else if (f.type === 'image-upload') obj[f.prop] = '';
    else obj[f.prop] = '';
  });
  return obj;
};

const api = {
  list: (params) => {
    const search = new URLSearchParams();
    search.set('page', String(params.page));
    search.set('pageSize', String(params.pageSize));
    Object.entries(props.apiParams).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') search.set(k, String(v));
    });
    return client.get(`${props.apiUrl}?${search.toString()}`);
  },
  create: (data) => client.post(props.apiUrl, data),
  update: (id, data) => client.patch(`${props.apiUrl}/${id}`, data),
  delete: (id) => client.delete(`${props.apiUrl}/${id}`),
};

const transformSave = (formValue) => {
  const payload = {};
  props.formFields.forEach((f) => {
    payload[f.prop] = formValue[f.prop];
  });
  return payload;
};

const crud = useCrud({
  api,
  defaultForm: buildEmptyForm(),
  responseAdapter: props.responseAdapter,
  formRules: props.rules,
  transformSave,
  pageSize: props.pageSize,
});

const selectedRows = ref([]);

const handleSelectionChange = (rows) => {
  selectedRows.value = rows;
};

const handleBatchDelete = async () => {
  const ids = selectedRows.value.map((r) => r.id);
  try {
    await ElMessageBox.confirm(`确认删除选中的 ${ids.length} 条记录？`, '提示', { type: 'warning' });
    await Promise.all(ids.map((id) => client.delete(`${props.apiUrl}/${id}`)));
    ElMessage.success('批量删除成功');
    selectedRows.value = [];
    crud.fetch();
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('批量删除失败');
  }
};

const formatJson = (val) => {
  if (!val) return '{}';
  try {
    const data = typeof val === 'string' ? JSON.parse(val) : val;
    return JSON.stringify(data, null, 2);
  } catch {
    return String(val);
  }
};

// 解构暴露给模板，保持原模板变量名完全兼容
const {
  items,
  total,
  page,
  pageSize,
  loading,
  dialogVisible,
  isEdit,
  saving,
  form,
  formRef,
  openDialog,
  handleSave,
  handleDelete,
  setParams,
  params,
} = crud;

defineExpose({ setParams, params, fetch: crud.fetch, refresh: crud.refresh });
</script>

<style scoped>
.json-preview {
  display: inline-block;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: monospace;
  font-size: 12px;
  color: #606266;
}
</style>
