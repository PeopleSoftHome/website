<template>
  <div>
    <h2 style="margin-bottom:20px">工作空间</h2>
    <el-card shadow="hover">
      <div style="margin-bottom:16px">
        <el-button type="primary" @click="openDialog()" v-if="!workspaces.length">+ 创建工作空间</el-button>
      </div>
      <el-table :data="workspaces" v-loading="loading" size="default">
        <el-table-column prop="name" label="名称" width="160" />
        <el-table-column prop="slug" label="Slug" width="160" />
        <el-table-column prop="plan" label="Plan" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'danger'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ownerId" label="Owner ID" width="200" />
        <el-table-column label="成员数" width="100">
          <template #default="{ row }">{{ row._count?.users ?? row.users?.length ?? 0 }}</template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDialog(row)">编辑</el-button>
            <el-button link type="primary" @click="openInviteDialog(row)">邀请成员</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑工作空间' : '新建工作空间'" width="480px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="状态" v-if="isEdit">
          <el-select v-model="form.status" style="width:100%">
            <el-option label="ACTIVE" value="ACTIVE" />
            <el-option label="SUSPENDED" value="SUSPENDED" />
            <el-option label="CANCELLED" value="CANCELLED" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="inviteVisible" title="邀请成员" width="440px">
      <el-form :model="inviteForm" label-width="80px">
        <el-form-item label="邮箱">
          <el-input v-model="inviteForm.email" placeholder="成员邮箱" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="inviteVisible = false">取消</el-button>
        <el-button type="primary" @click="handleInvite" :loading="inviteLoading">发送邀请</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import client from '@/api/client.js';

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
      ElMessage.success('更新成功');
    } else {
      await client.post('/workspaces', { name: form.value.name });
      ElMessage.success('创建成功');
    }
    dialogVisible.value = false;
    fetchWorkspaces();
  } catch (e) {
    ElMessage.error(e.message || '保存失败');
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
    ElMessage.warning('请输入邮箱');
    return;
  }
  inviteLoading.value = true;
  try {
    await client.post(`/workspaces/${currentWorkspace.value.id}/invite`, {
      id: currentWorkspace.value.id,
      email: inviteForm.value.email,
    });
    ElMessage.success('邀请已发送');
    inviteVisible.value = false;
  } catch (e) {
    ElMessage.error(e.message || '邀请失败');
  }
  inviteLoading.value = false;
};

onMounted(fetchWorkspaces);
</script>
