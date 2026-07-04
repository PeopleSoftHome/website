<template>
  <div>
    <h2 style="margin-top: 0">{{ t('featureFlags.title') }}</h2>
    <p style="color: var(--admin-text-secondary); margin-bottom: 16px">
      {{ t('featureFlags.description') }}
    </p>

    <el-card shadow="hover" v-loading="loading">
      <div style="margin-bottom: 16px">
        <el-button type="primary" @click="openDialog()">+ {{ t('featureFlags.addFlag') }}</el-button>
        <el-button @click="fetch">{{ t('featureFlags.refresh') }}</el-button>
      </div>

      <el-table :data="flagList" size="default">
        <el-table-column prop="key" :label="t('featureFlags.key')" width="240" />
        <el-table-column :label="t('featureFlags.status')" width="120">
          <template #default="{ row }">
            <el-switch
              v-model="row.value"
              @change="(val) => toggle(row.key, val)"
            />
          </template>
        </el-table-column>
        <el-table-column :label="t('featureFlags.operation')" width="120">
          <template #default="{ row }">
            <el-button link type="danger" @click="remove(row.key)">{{ t('featureFlags.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!flagList.length" :description="t('featureFlags.noFlags')" />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="t('featureFlags.addFlagDialog')" width="480px">
      <el-form :model="form" label-width="80px">
        <el-form-item :label="t('featureFlags.key')">
          <el-input v-model="form.key" placeholder="enableNewPricing" />
        </el-form-item>
        <el-form-item :label="t('featureFlags.enabled')">
          <el-switch v-model="form.value" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ t('featureFlags.cancel') }}</el-button>
        <el-button type="primary" @click="addFlag" :loading="saving">{{ t('featureFlags.save') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox } from 'element-plus';
import client from '@/api/client.js';

const { t } = useI18n();

const loading = ref(false);
const saving = ref(false);
const flags = ref({});
const dialogVisible = ref(false);
const form = ref({ key: '', value: true });

const flagList = computed(() =>
  Object.entries(flags.value).map(([key, value]) => ({ key, value: !!value })),
);

const fetch = async () => {
  loading.value = true;
  try {
    const res = await client.get('/system/settings');
    const rows = res?.data?.data || [];
    const row = rows.find((r) => r.key === 'featureFlags');
    flags.value = row?.value && typeof row.value === 'object' ? row.value : {};
  } catch (e) {
    ElMessage.error(t('featureFlags.loadFailed'));
  } finally {
    loading.value = false;
  }
};

const saveFlags = async (nextFlags) => {
  saving.value = true;
  try {
    await client.post('/system/settings', {
      key: 'featureFlags',
      value: nextFlags,
      description: 'feature flags config',
    });
    flags.value = { ...nextFlags };
    ElMessage.success(t('featureFlags.saveSuccess'));
  } catch (e) {
    ElMessage.error(e.message || t('featureFlags.saveFailed'));
  } finally {
    saving.value = false;
  }
};

const toggle = (key, val) => {
  saveFlags({ ...flags.value, [key]: val });
};

const remove = async (key) => {
  try {
    await ElMessageBox.confirm(t('featureFlags.deleteConfirm', { key }), t('featureFlags.deleteTip'), { type: 'warning' });
    const next = { ...flags.value };
    delete next[key];
    await saveFlags(next);
  } catch (e) {
    if (e !== 'cancel') ElMessage.error(t('featureFlags.deleteFailed'));
  }
};

const openDialog = () => {
  form.value = { key: '', value: true };
  dialogVisible.value = true;
};

const addFlag = async () => {
  if (!form.value.key.trim()) {
    ElMessage.warning(t('featureFlags.keyRequired'));
    return;
  }
  await saveFlags({ ...flags.value, [form.value.key.trim()]: form.value.value });
  dialogVisible.value = false;
};

onMounted(fetch);
</script>
