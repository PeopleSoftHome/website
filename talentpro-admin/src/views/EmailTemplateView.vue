<template>
  <div>
    <h2 style="margin-bottom:20px">邮件模板</h2>
    <el-card shadow="hover">
      <div style="margin-bottom:16px">
        <el-button type="primary" @click="openDialog()">+ 新建模板</el-button>
      </div>
      <el-table :data="templates" v-loading="loading" size="default">
        <el-table-column prop="key" label="Key" width="200" />
        <el-table-column prop="subject" label="主题" min-width="200" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDialog(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑邮件模板' : '新建邮件模板'" width="640px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="Key">
          <el-input v-model="form.key" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="主题">
          <el-input v-model="form.subject" />
        </el-form-item>
        <el-form-item label="正文">
          <el-input v-model="form.body" type="textarea" :rows="4" placeholder="纯文本内容" />
        </el-form-item>
        <el-form-item label="HTML">
          <el-input v-model="form.html" type="textarea" :rows="6" placeholder="HTML 内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <AiAssistButton
          type="email-template"
          :title="form.subject"
          :content="form.body || form.html"
          @result="(p) => { aiPayload.value = p; aiVisible.value = true; }"
        />
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
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
import { ElMessage, ElMessageBox } from 'element-plus';
import client from '@/api/client.js';
import AiAssistButton from '@/components/AiAssistButton.vue';
import AiAssistDialog from '@/components/AiAssistDialog.vue';

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
    ElMessage.error('加载邮件模板失败');
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
    ElMessage.success('保存成功');
    dialogVisible.value = false;
    fetchTemplates();
  } catch (e) {
    ElMessage.error(e.message || '保存失败');
  }
  saving.value = false;
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确认删除模板 "${row.key}"？`, '提示', { type: 'warning' });
    await client.delete(`/system/email-templates/${row.key}`);
    ElMessage.success('删除成功');
    fetchTemplates();
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('删除失败');
  }
};

onMounted(fetchTemplates);

const applyAiResult = ({ action, result }, target) => {
  if (result.title) target.subject = result.title;
  if (result.summary) target.body = result.summary;
  if (result.content) target.body = result.content;
  if (result.translation) target.body = result.translation;
  ElMessage.success('已应用生成结果，请确认后再保存');
};
</script>
