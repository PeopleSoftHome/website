<!--
  Settings View 组件

  位于: views/SettingsView.vue
-->
<template>
  <div>
    <h2 style="margin-bottom:20px">{{ t('settings.title') }}</h2>
    <el-card shadow="hover">
      <div style="margin-bottom:16px">
        <el-button type="primary" @click="openDialog()">+ {{ t('settings.create') }}</el-button>
      </div>
      <el-table :data="settings" v-loading="loading" size="default">
        <el-table-column prop="key" :label="t('settings.key')" width="200" />
        <el-table-column :label="t('settings.value')" min-width="200">
          <template #default="{ row }">
            <el-tooltip :content="formatValue(row.value)" placement="top">
              <span style="display:inline-block;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
                {{ formatValue(row.value) }}
              </span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="description" :label="t('settings.description')" min-width="200" />
        <el-table-column :label="t('common.actions')" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDialog(row)">{{ t('common.edit') }}</el-button>
            <el-button link type="danger" @click="handleDelete(row)">{{ t('common.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? t('settings.edit') : t('settings.create')" width="560px">
      <el-form :model="form" label-width="80px">
        <el-form-item :label="t('settings.key')">
          <el-input v-model="form.key" :disabled="isEdit" />
        </el-form-item>
        <el-form-item :label="t('settings.value')">
          <el-input v-model="form.value" type="textarea" :rows="6" :placeholder="t('settings.jsonPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('settings.description')">
          <el-input v-model="form.description" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">{{ t('common.save') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox } from 'element-plus';
import client from '@/api/client';

const { t } = useI18n();

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
    ElMessage.error(t('settings.loadFailed'));
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
    ElMessage.success(t('settings.saveSuccess'));
    dialogVisible.value = false;
    fetchSettings();
  } catch (e) {
    ElMessage.error(e.message || t('settings.saveFailed'));
  }
  saving.value = false;
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(t('settings.deleteConfirm', { key: row.key }), t('common.tip'), { type: 'warning' });
    await client.delete(`/system/settings/${row.key}`);
    ElMessage.success(t('settings.deleteSuccess'));
    fetchSettings();
  } catch (e) {
    if (e !== 'cancel') ElMessage.error(t('settings.deleteFailed'));
  }
};

onMounted(fetchSettings);
</script>
