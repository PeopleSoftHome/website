<!--
  Email Template View 组件

  位于: views/EmailTemplateView.vue
-->
<template>
  <div>
    <h2 style="margin-bottom:20px">{{ t('emailTemplates.title') }}</h2>
    <el-card shadow="hover">
      <div style="margin-bottom:16px">
        <el-button type="primary" @click="openDialog()">+ {{ t('emailTemplates.createTemplate') }}</el-button>
      </div>
      <el-table :data="templates" v-loading="loading" size="default">
        <el-table-column prop="key" :label="t('emailTemplates.key')" width="200" />
        <el-table-column prop="subject" :label="t('emailTemplates.subject')" min-width="200" />
        <el-table-column :label="t('emailTemplates.operation')" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDialog(row)">{{ t('emailTemplates.edit') }}</el-button>
            <el-button link type="danger" @click="handleDelete(row)">{{ t('emailTemplates.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? t('emailTemplates.editTemplate') : t('emailTemplates.createTemplateDialog')" width="640px">
      <el-form :model="form" label-width="80px">
        <el-form-item :label="t('emailTemplates.key')">
          <el-input v-model="form.key" :disabled="isEdit" />
        </el-form-item>
        <el-form-item :label="t('emailTemplates.subject')">
          <el-input v-model="form.subject" />
        </el-form-item>
        <el-form-item :label="t('emailTemplates.body')">
          <el-input v-model="form.body" type="textarea" :rows="4" :placeholder="t('emailTemplates.plainText')" />
        </el-form-item>
        <el-form-item :label="t('emailTemplates.html')">
          <el-input v-model="form.html" type="textarea" :rows="6" :placeholder="t('emailTemplates.htmlContent')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <AiAssistButton
          type="email-template"
          :title="form.subject"
          :content="form.body || form.html"
          @result="(p) => { aiPayload.value = p; aiVisible.value = true; }"
        />
        <el-button @click="dialogVisible = false">{{ t('emailTemplates.cancel') }}</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">{{ t('emailTemplates.save') }}</el-button>
      </template>
    </el-dialog>

    <AiAssistDialog
      v-model:visible="aiVisible"
      type="email-template"
      :title="aiPayload.title"
      :content="aiPayload.content"
      @apply="(r) => applyAiResult(r, form)"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox } from 'element-plus';
import client from '@/api/client';
import AiAssistButton from '@/components/ai/AiAssistButton.vue';
import AiAssistDialog from '@/components/ai/AiAssistDialog.vue';

const { t } = useI18n();

const aiVisible = ref(false);
const aiPayload = ref({ type: 'email-template', title: '', content: '' });

const templates = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const saving = ref(false);
const form = ref({ key: '', subject: '', body: '', html: '' });

const fetchTemplates = async () => {
  loading.value = true;
  try {
    const res = await client.get('/system/email-templates');
    templates.value = Array.isArray(res.data) ? res.data : [];
  } catch (e) {
    ElMessage.error(t('emailTemplates.loadFailed'));
  }
  loading.value = false;
};

const openDialog = (row = null) => {
  isEdit.value = !!row;
  if (row) {
    form.value = { key: row.key, subject: row.subject, body: row.body || '', html: row.html || '' };
  } else {
    form.value = { key: '', subject: '', body: '', html: '' };
  }
  dialogVisible.value = true;
};

const handleSave = async () => {
  saving.value = true;
  try {
    await client.post('/system/email-templates', form.value);
    ElMessage.success(t('emailTemplates.saveSuccess'));
    dialogVisible.value = false;
    fetchTemplates();
  } catch (e) {
    ElMessage.error(e.message || t('emailTemplates.saveFailed'));
  }
  saving.value = false;
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(t('emailTemplates.deleteConfirm', { key: row.key }), t('emailTemplates.deleteTip'), { type: 'warning' });
    await client.delete(`/system/email-templates/${row.key}`);
    ElMessage.success(t('emailTemplates.deleteSuccess'));
    fetchTemplates();
  } catch (e) {
    if (e !== 'cancel') ElMessage.error(t('emailTemplates.deleteFailed'));
  }
};

onMounted(fetchTemplates);

const applyAiResult = ({ action, result }, target) => {
  if (result.title) target.subject = result.title;
  if (result.summary) target.body = result.summary;
  if (result.content) target.body = result.content;
  if (result.translation) target.body = result.translation;
  ElMessage.success(t('emailTemplates.applied'));
};
</script>
