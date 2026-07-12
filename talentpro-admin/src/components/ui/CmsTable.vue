<!--
  Cms Table 组件

  位于: components/ui/CmsTable.vue
-->
<template>
  <div>
    <div class="cms-table-header">
      <div>
        <el-button type="primary" @click="openDialog()">+ {{ t('cmsTable.create') }}</el-button>
        <el-button
          v-if="selection"
          type="danger"
          :disabled="!selectedRows.length"
          @click="handleBatchDelete"
          style="margin-left: 12px"
        >
          {{ t('cmsTable.batchDeleteCount', { count: selectedRows.length }) }}
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
                {{ row[col.prop] ? t('cmsTable.yes') : t('cmsTable.no') }}
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

      <el-table-column :label="t('cmsTable.operation')" width="180" fixed="right">
        <template #default="{ row }">
          <slot name="actions" :row="row">
            <el-button link type="primary" @click="openDialog(row)">{{ t('cmsTable.edit') }}</el-button>
            <el-button link type="danger" @click="handleDelete(row)">{{ t('cmsTable.delete') }}</el-button>
          </slot>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      style="margin-top: 16px; justify-content: flex-end"
      layout="prev, pager, next"
      :total="total"
      :page-size="crud.pageSize"
      v-model:current-page="page"
    />

    <el-dialog v-model="dialogVisible" :title="isEdit ? t('cmsTable.editDialog') : t('cmsTable.createDialog')" width="600px" destroy-on-close>
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
        <AiAssistButton
          v-if="aiAssist"
          :type="aiAssistType"
          :title="form.title || ''"
          :content="form.content || form.summary || form.excerpt || form.description || ''"
          @result="(p) => { aiPayload = p; aiVisible = true; }"
        />
        <el-button @click="dialogVisible = false">{{ t('cmsTable.cancel') }}</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">{{ t('cmsTable.save') }}</el-button>
      </template>
    </el-dialog>

    <AiAssistDialog
      v-if="aiAssist"
      v-model:visible="aiVisible"
      :type="aiAssistType"
      :title="aiPayload.title"
      :content="aiPayload.content"
      @apply="applyAiResult"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox } from 'element-plus';
import client from '@/api/client.js';
import ImageUpload from './ImageUpload.vue';
import AiAssistButton from '../ai/AiAssistButton.vue';
import AiAssistDialog from '../ai/AiAssistDialog.vue';
import { useCrud } from '@/composables/useCrud.js';

const { t } = useI18n();

/**
 * 声明式 CMS CRUD 表格组件
 * @prop {string} apiUrl - REST API 基础路径，如 '/api/v1/admin/blogs'
 * @prop {Array<{prop:string,label:string,type?:string,width?:string}>} columns - 表格列配置
 * @prop {Array<{prop:string,label:string,type?:string}>} formFields - 表单字段配置
 * @prop {Function} [responseAdapter] - 列表响应适配器：({ data, meta }) => { items, total }
 * @prop {Object} [rules] - ElForm 校验规则
 * @prop {boolean} [selection=false] - 是否开启批量选择
 * @prop {number} [pageSize=20] - 每页条数
 * @prop {Object} [apiParams] - 固定查询参数
 * @prop {boolean|Object|string} [aiAssist=false] - 是否显示 AI 辅助按钮；传对象可配置 { type }
 * @expose {Function} setParams - 设置查询参数并刷新
 * @expose {Object} params - 当前查询参数
 * @expose {Function} fetch - 手动拉取数据
 * @expose {Function} refresh - 刷新当前页
 */
const props = defineProps({
  apiUrl: { type: String, required: true },
  columns: { type: Array, required: true },
  formFields: { type: Array, required: true },
  responseAdapter: { type: Function, default: null },
  rules: { type: Object, default: () => ({}) },
  selection: { type: Boolean, default: false },
  pageSize: { type: Number, default: 20 },
  apiParams: { type: Object, default: () => ({}) },
  aiAssist: { type: [Boolean, Object], default: false },
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
const aiVisible = ref(false);
const aiPayload = ref({ type: 'content', title: '', content: '' });
const aiAssistType = computed(() => {
  if (typeof props.aiAssist === 'string') return props.aiAssist;
  if (props.aiAssist && typeof props.aiAssist === 'object' && props.aiAssist.type) return props.aiAssist.type;
  return 'content';
});

const applyAiResult = ({ action, result }) => {
  // 标题类字段：优先 title，其次 name / label
  if (result.title) {
    if ('title' in form.value) form.value.title = result.title;
    else if ('name' in form.value) form.value.name = result.title;
    else if ('label' in form.value) form.value.label = result.title;
    else if ('subject' in form.value) form.value.subject = result.title;
  }
  // 描述类字段
  if (result.description) {
    if ('description' in form.value) form.value.description = result.description;
    else if ('tagline' in form.value) form.value.tagline = result.description;
    else if ('summary' in form.value) form.value.summary = result.description;
    else if ('excerpt' in form.value) form.value.excerpt = result.description;
  }
  if (result.summary && 'summary' in form.value) form.value.summary = result.summary;
  if (result.excerpt && 'excerpt' in form.value) form.value.excerpt = result.excerpt;
  // 正文类字段
  if (result.content) {
    if ('content' in form.value) form.value.content = result.content;
    else if ('body' in form.value) form.value.body = result.content;
  }
  if (result.translation) {
    if ('content' in form.value) form.value.content = result.translation;
    else if ('body' in form.value) form.value.body = result.translation;
  }
  // SEO 关键词：如果表单有 keywords 字段则填入
  if (result.keywords && 'keywords' in form.value) form.value.keywords = result.keywords;
  ElMessage.success(t('cmsTable.applied'));
};

const handleSelectionChange = (rows) => {
  selectedRows.value = rows;
};

const handleBatchDelete = async () => {
  const ids = selectedRows.value.map((r) => r.id);
  try {
    await ElMessageBox.confirm(t('cmsTable.batchDeleteConfirm', { count: ids.length }), t('common.tip'), { type: 'warning' });
    await Promise.all(ids.map((id) => client.delete(`${props.apiUrl}/${id}`)));
    ElMessage.success(t('cmsTable.batchDeleteSuccess'));
    selectedRows.value = [];
    crud.fetch();
  } catch (e) {
    if (e !== 'cancel') ElMessage.error(t('cmsTable.batchDeleteFailed'));
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
  color: var(--admin-text-regular);
}
</style>
