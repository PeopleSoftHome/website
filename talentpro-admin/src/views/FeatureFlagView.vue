<template>
  <div>
    <h2 style="margin-top: 0">功能开关</h2>
    <p style="color: #666; margin-bottom: 16px">
      管理灰度发布与模块启停。开关以 JSON 对象形式存储在 <code>featureFlags</code> 设置项中。
    </p>

    <el-card shadow="hover" v-loading="loading">
      <div style="margin-bottom: 16px">
        <el-button type="primary" @click="openDialog()">+ 新增开关</el-button>
        <el-button @click="fetch">刷新</el-button>
      </div>

      <el-table :data="flagList" size="default">
        <el-table-column prop="key" label="Key" width="240" />
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-switch
              v-model="row.value"
              @change="(val) => toggle(row.key, val)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button link type="danger" @click="remove(row.key)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!flagList.length" description="暂无功能开关" />
    </el-card>

    <el-dialog v-model="dialogVisible" title="新增功能开关" width="480px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="Key">
          <el-input v-model="form.key" placeholder="如 enableNewPricing" />
        </el-form-item>
        <el-form-item label="开启">
          <el-switch v-model="form.value" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addFlag" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import client from '@/api/client.js';

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
    ElMessage.error('加载失败');
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
      description: '功能开关配置',
    });
    flags.value = { ...nextFlags };
    ElMessage.success('保存成功');
  } catch (e) {
    ElMessage.error(e.message || '保存失败');
  } finally {
    saving.value = false;
  }
};

const toggle = (key, val) => {
  saveFlags({ ...flags.value, [key]: val });
};

const remove = async (key) => {
  try {
    await ElMessageBox.confirm(`确认删除开关 "${key}"？`, '提示', { type: 'warning' });
    const next = { ...flags.value };
    delete next[key];
    await saveFlags(next);
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('删除失败');
  }
};

const openDialog = () => {
  form.value = { key: '', value: true };
  dialogVisible.value = true;
};

const addFlag = async () => {
  if (!form.value.key.trim()) {
    ElMessage.warning('请输入 Key');
    return;
  }
  await saveFlags({ ...flags.value, [form.value.key.trim()]: form.value.value });
  dialogVisible.value = false;
};

onMounted(fetch);
</script>
