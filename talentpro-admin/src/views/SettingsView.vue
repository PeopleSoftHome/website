<template>
  <div>
    <h2 style="margin-bottom:20px">系统设置</h2>
    <el-card shadow="hover">
      <div style="margin-bottom:16px">
        <el-button type="primary" @click="openDialog()">+ 新建设置</el-button>
      </div>
      <el-table :data="settings" v-loading="loading" size="default">
        <el-table-column prop="key" label="Key" width="200" />
        <el-table-column label="Value" min-width="200">
          <template #default="{ row }">
            <el-tooltip :content="formatValue(row.value)" placement="top">
              <span style="display:inline-block;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
                {{ formatValue(row.value) }}
              </span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDialog(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑设置' : '新建设置'" width="560px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="Key">
          <el-input v-model="form.key" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="Value">
          <el-input v-model="form.value" type="textarea" :rows="6" placeholder="JSON 格式" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" />
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
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import client from '@/api/client.js';

const settings = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const saving = ref(false);
const form = ref({ key: '', value: '', description: '' });

const formatValue = (v) => {
  if (v === null || v === undefined) return '';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
};

const fetchSettings = async () => {
  loading.value = true;
  try {
    const res = await client.get('/system/settings');
    const payload = res.data;
    settings.value = payload?.data || [];
  } catch (e) {
    ElMessage.error('加载设置失败');
  }
  loading.value = false;
};

const openDialog = (row = null) => {
  isEdit.value = !!row;
  if (row) {
    form.value = {
      key: row.key,
      value: typeof row.value === 'object' ? JSON.stringify(row.value, null, 2) : String(row.value),
      description: row.description || '',
    };
  } else {
    form.value = { key: '', value: '', description: '' };
  }
  dialogVisible.value = true;
};

const handleSave = async () => {
  saving.value = true;
  try {
    let parsedValue = form.value.value;
    try {
      parsedValue = JSON.parse(form.value.value);
    } catch {
      /* keep as string */
    }
    const payload = {
      key: form.value.key,
      value: parsedValue,
      description: form.value.description,
    };
    await client.post('/system/settings', payload);
    ElMessage.success('保存成功');
    dialogVisible.value = false;
    fetchSettings();
  } catch (e) {
    ElMessage.error(e.message || '保存失败');
  }
  saving.value = false;
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确认删除设置 "${row.key}"？`, '提示', { type: 'warning' });
    await client.delete(`/system/settings/${row.key}`);
    ElMessage.success('删除成功');
    fetchSettings();
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('删除失败');
  }
};

onMounted(fetchSettings);
</script>
