<!--
  Workspace View 组件

  位于: views/WorkspaceView.vue
-->
<template>
  <div>
    <h2 style="margin-bottom:20px">{{ t('workspaces.title') }}</h2>
    <el-card shadow="hover">
      <div style="margin-bottom:16px">
        <el-button type="primary" @click="openDialog()" v-if="!workspaces.length">+ {{ t('workspaces.createWorkspace') }}</el-button>
      </div>
      <el-table :data="workspaces" v-loading="loading" size="default">
        <el-table-column prop="name" :label="t('workspaces.name')" width="160" />
        <el-table-column prop="slug" :label="t('workspaces.slug')" width="160" />
        <el-table-column prop="plan" :label="t('workspaces.plan')" width="100" />
        <el-table-column prop="status" :label="t('workspaces.status')" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'danger'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ownerId" :label="t('workspaces.ownerId')" width="200" />
        <el-table-column :label="t('workspaces.memberCount')" width="100">
          <template #default="{ row }">{{ row._count?.users ?? row.users?.length ?? 0 }}</template>
        </el-table-column>
        <el-table-column :label="t('workspaces.operation')" width="260" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDialog(row)">{{ t('workspaces.edit') }}</el-button>
            <el-button link type="primary" @click="openInviteDialog(row)">{{ t('workspaces.inviteMember') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? t('workspaces.editWorkspace') : t('workspaces.createWorkspaceDialog')" width="480px">
      <el-form :model="form" label-width="80px">
        <el-form-item :label="t('workspaces.name')">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item :label="t('workspaces.status')" v-if="isEdit">
          <el-select v-model="form.status" style="width:100%">
            <el-option label="ACTIVE" value="ACTIVE" />
            <el-option label="SUSPENDED" value="SUSPENDED" />
            <el-option label="CANCELLED" value="CANCELLED" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ t('workspaces.cancel') }}</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">{{ t('workspaces.save') }}</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="inviteVisible" :title="t('workspaces.inviteTitle')" width="440px">
      <el-form :model="inviteForm" label-width="80px">
        <el-form-item :label="t('workspaces.email')">
          <el-input v-model="inviteForm.email" :placeholder="t('workspaces.memberEmail')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="inviteVisible = false">{{ t('workspaces.cancel') }}</el-button>
        <el-button type="primary" @click="handleInvite" :loading="inviteLoading">{{ t('workspaces.sendInvite') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import client from '@/api/client';

const { t } = useI18n();

const workspaces = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const saving = ref(false);
const form = ref({ id: '', name: '', status: 'ACTIVE' });

const inviteVisible = ref(false);
const inviteLoading = ref(false);
const inviteForm = ref({ email: '' });
const currentWorkspace = ref(null);

const fetchWorkspaces = async () => {
  loading.value = true;
  try {
    const res = await client.get('/workspaces/me');
    if (res.data?.workspace) {
      workspaces.value = [res.data.workspace];
    } else {
      workspaces.value = [];
    }
  } catch (e) {
    workspaces.value = [];
  }
  loading.value = false;
};

const openDialog = (row = null) => {
  isEdit.value = !!row;
  if (row) {
    form.value = { id: row.id, name: row.name, status: row.status };
  } else {
    form.value = { id: '', name: '', status: 'ACTIVE' };
  }
  dialogVisible.value = true;
};

const handleSave = async () => {
  saving.value = true;
  try {
    if (isEdit.value) {
      await client.patch(`/workspaces/${form.value.id}`, { id: form.value.id, name: form.value.name, status: form.value.status });
      ElMessage.success(t('workspaces.updateSuccess'));
    } else {
      await client.post('/workspaces', { name: form.value.name });
      ElMessage.success(t('workspaces.createSuccess'));
    }
    dialogVisible.value = false;
    fetchWorkspaces();
  } catch (e) {
    ElMessage.error(e.message || t('workspaces.saveFailed'));
  }
  saving.value = false;
};

const openInviteDialog = (row) => {
  currentWorkspace.value = row;
  inviteForm.value = { email: '' };
  inviteVisible.value = true;
};

const handleInvite = async () => {
  if (!inviteForm.value.email) {
    ElMessage.warning(t('workspaces.emailRequired'));
    return;
  }
  inviteLoading.value = true;
  try {
    await client.post(`/workspaces/${currentWorkspace.value.id}/invite`, {
      id: currentWorkspace.value.id,
      email: inviteForm.value.email,
    });
    ElMessage.success(t('workspaces.inviteSent'));
    inviteVisible.value = false;
  } catch (e) {
    ElMessage.error(e.message || t('workspaces.inviteFailed'));
  }
  inviteLoading.value = false;
};

onMounted(fetchWorkspaces);
</script>
