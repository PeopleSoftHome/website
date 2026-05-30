<template>
  <div>
    <h2 style="margin-bottom:20px">角色管理</h2>
    <el-card shadow="hover">
      <div style="margin-bottom:16px">
        <el-button type="primary" @click="crud.openDialog()">+ 新建角色</el-button>
      </div>
      <el-table :data="crud.items" v-loading="crud.loading" size="default">
        <el-table-column prop="name" label="角色名" width="160" />
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column label="权限" min-width="300">
          <template #default="{ row }">
            <el-tag v-for="perm in row.permissions" :key="perm.id" size="small" style="margin-right:6px;margin-bottom:4px">
              {{ perm.resource }}:{{ perm.action }}
            </el-tag>
            <span v-if="!row.permissions?.length" style="color:#999">无权限</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="crud.openDialog(row)">编辑</el-button>
            <el-button link type="danger" @click="crud.handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="crud.dialogVisible" :title="crud.isEdit ? '编辑角色' : '新建角色'" width="560px">
      <el-form :model="crud.form" label-width="80px" :rules="rules" ref="crud.formRef">
        <el-form-item label="角色名" prop="name">
          <el-input v-model="crud.form.name" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="crud.form.description" />
        </el-form-item>
        <el-form-item label="权限">
          <el-select v-model="crud.form.permissionIds" multiple style="width:100%">
            <el-option v-for="perm in allPermissions" :key="perm.id" :label="`${perm.resource}:${perm.action}`" :value="perm.id" />
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
import { ref, onMounted } from 'vue';
import client from '@/api/client.js';
import { useCrud } from '@/composables/useCrud.js';

const crud = useCrud({
  api: {
    list: () => client.get('/roles'),
    create: (d) => client.post('/roles', d),
    update: (id, d) => client.patch(`/roles/${id}`, d),
    delete: (id) => client.delete(`/roles/${id}`),
  },
  defaultForm: { name: '', description: '', permissionIds: [] },
  formRules: {
    name: [{ required: true, message: '请输入角色名', trigger: 'blur' }],
  },
});

const allPermissions = ref([]);
const rules = crud.formRules;

const fetchPermissions = async () => {
  try {
    const res = await client.get('/roles');
    const roles = Array.isArray(res.data) ? res.data : [];
    const permMap = new Map();
    roles.forEach((r) => {
      r.permissions?.forEach((p) => {
        if (!permMap.has(p.id)) permMap.set(p.id, p);
      });
    });
    allPermissions.value = Array.from(permMap.values());
  } catch (e) {
    if (import.meta.env.DEV) console.error(e);
  }
};

onMounted(fetchPermissions);
</script>
