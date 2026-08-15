<!--
  Users View 组件

  位于: views/UsersView.vue
-->
<template>
  <div>
    <h2 style="margin-bottom:20px">{{ t('users.title') }}</h2>
    <el-card shadow="hover">
      <div style="margin-bottom:16px">
        <el-button type="primary" @click="crud.openDialog()">+ {{ t('users.create') }}</el-button>
      </div>
      <el-table :data="crud.items" v-loading="crud.loading" size="default">
        <el-table-column prop="name" :label="t('users.name')" width="120" />
        <el-table-column prop="email" :label="t('users.email')" min-width="180" />
        <el-table-column prop="phone" :label="t('users.phone')" width="130" />
        <el-table-column prop="role.name" :label="t('users.role')" width="120">
          <template #default="{ row }">
            <el-tag>{{ row.role?.name || '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" :label="t('users.status')" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              active-value="ACTIVE"
              inactive-value="INACTIVE"
              @change="(val) => toggleStatus(row, val)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" :label="t('users.createdAt')" width="160">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column :label="t('common.actions')" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="crud.openDialog(row)">{{ t('common.edit') }}</el-button>
            <el-button link type="danger" @click="crud.handleDelete(row)">{{ t('common.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        style="margin-top:16px;justify-content:flex-end"
        layout="prev, pager, next"
        :total="crud.total"
        :page-size="crud.pageSize"
        v-model:current-page="crud.page"
        @current-change="crud.fetch"
      />
    </el-card>

    <el-dialog v-model="crud.dialogVisible" :title="crud.isEdit ? t('users.edit') : t('users.create')" width="520px">
      <el-form :model="crud.form" label-width="80px" :rules="rules" ref="crud.formRef">
        <el-form-item :label="t('users.email')" prop="email">
          <el-input v-model="crud.form.email" :disabled="crud.isEdit" />
        </el-form-item>
        <el-form-item :label="t('users.password')" prop="password" v-if="!crud.isEdit">
          <el-input v-model="crud.form.password" type="password" show-password />
        </el-form-item>
        <el-form-item :label="t('users.name')" prop="name">
          <el-input v-model="crud.form.name" />
        </el-form-item>
        <el-form-item :label="t('users.phone')">
          <el-input v-model="crud.form.phone" />
        </el-form-item>
        <el-form-item :label="t('users.role')">
          <el-select v-model="crud.form.roleId" style="width:100%">
            <el-option v-for="role in roles" :key="role.id" :label="role.name" :value="role.id" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('users.status')">
          <el-select v-model="crud.form.status" style="width:100%">
            <el-option label="ACTIVE" value="ACTIVE" />
            <el-option label="INACTIVE" value="INACTIVE" />
            <el-option label="BANNED" value="BANNED" />
            <el-option label="PENDING" value="PENDING" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="crud.dialogVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="crud.handleSave" :loading="crud.saving">{{ t('common.save') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { formatDate } from '@/utils/formatDate';
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import client from '@/api/client';
import { useCrud } from '@/composables/useCrud';

const { t } = useI18n();

const crud = useCrud({
  api: {
    list: (p) => client.get(`/users?page=${p.page}&pageSize=${p.pageSize}`),
    create: (d) => client.post('/users', d),
    update: (id, d) => client.patch(`/users/${id}`, d),
    delete: (id) => client.delete(`/users/${id}`),
  },
  defaultForm: { email: '', password: '', name: '', phone: '', roleId: '', status: 'ACTIVE' },
  formRules: {
    email: [{ required: true, message: t('users.emailRequired'), trigger: 'blur' }],
    password: [{ required: true, message: t('users.passwordRequired'), trigger: 'blur' }],
    name: [{ required: true, message: t('users.nameRequired'), trigger: 'blur' }],
  },
  transformSave: (form, isEdit) =>
    isEdit
      ? { name: form.name, phone: form.phone, roleId: form.roleId, status: form.status }
      : { ...form },
});

const roles = ref([]);
const rules = crud.formRules;

const fetchRoles = async () => {
  try {
    const res = await client.get('/roles');
    roles.value = Array.isArray(res.data) ? res.data : [];
  } catch (e) {
    if (import.meta.env.DEV) console.error(e);
  }
};

onMounted(fetchRoles);

const toggleStatus = async (row, val) => {
  try {
    await client.patch(`/users/${row.id}`, { status: val });
    ElMessage.success(t('users.statusUpdateSuccess'));
  } catch (e) {
    ElMessage.error(t('users.statusUpdateFailed'));
    row.status = val === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  }
};


</script>
