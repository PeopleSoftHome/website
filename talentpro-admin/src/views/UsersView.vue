<template>
  <div>
    <h2 style="margin-bottom:20px">用户管理</h2>
    <el-card shadow="hover">
      <div style="margin-bottom:16px">
        <el-button type="primary" @click="crud.openDialog()">+ 新建用户</el-button>
      </div>
      <el-table :data="crud.items" v-loading="crud.loading" size="default">
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="phone" label="手机" width="130" />
        <el-table-column prop="role.name" label="角色" width="120">
          <template #default="{ row }">
            <el-tag>{{ row.role?.name || '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              active-value="ACTIVE"
              inactive-value="INACTIVE"
              @change="(val) => toggleStatus(row, val)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="注册时间" width="160">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="crud.openDialog(row)">编辑</el-button>
            <el-button link type="danger" @click="crud.handleDelete(row)">删除</el-button>
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

    <el-dialog v-model="crud.dialogVisible" :title="crud.isEdit ? '编辑用户' : '新建用户'" width="520px">
      <el-form :model="crud.form" label-width="80px" :rules="rules" ref="crud.formRef">
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="crud.form.email" :disabled="crud.isEdit" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!crud.isEdit">
          <el-input v-model="crud.form.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="crud.form.name" />
        </el-form-item>
        <el-form-item label="手机">
          <el-input v-model="crud.form.phone" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="crud.form.roleId" style="width:100%">
            <el-option v-for="role in roles" :key="role.id" :label="role.name" :value="role.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="crud.form.status" style="width:100%">
            <el-option label="ACTIVE" value="ACTIVE" />
            <el-option label="INACTIVE" value="INACTIVE" />
            <el-option label="BANNED" value="BANNED" />
            <el-option label="PENDING" value="PENDING" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="crud.dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="crud.handleSave" :loading="crud.saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { formatDate } from '@/utils/formatDate.js';
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import client from '@/api/client.js';
import { useCrud } from '@/composables/useCrud.js';

const crud = useCrud({
  api: {
    list: (p) => client.get(`/users?page=${p.page}&pageSize=${p.pageSize}`),
    create: (d) => client.post('/users', d),
    update: (id, d) => client.patch(`/users/${id}`, d),
    delete: (id) => client.delete(`/users/${id}`),
  },
  defaultForm: { email: '', password: '', name: '', phone: '', roleId: '', status: 'ACTIVE' },
  formRules: {
    email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
    name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  },
  transformSave: (form, isEdit) =>
    isEdit
      ? { name: form.name, phone: form.phone, roleId: form.roleId, status: form.status }
      : { ...form },
});

const roles = ref([]);

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
    ElMessage.success('状态更新成功');
  } catch (e) {
    ElMessage.error('状态更新失败');
    row.status = val === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  }
};


</script>
