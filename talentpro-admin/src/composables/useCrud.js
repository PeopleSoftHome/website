import { ref, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useList } from './useList.js';

/**
 * 通用 CRUD 状态管理 Composable（基于 useList）
 *
 * @param {Object} options
 * @param {Object} options.api - { list, create, update, delete }
 *   list: (params) => Promise<response>
 *   create: (data) => Promise
 *   update: (id, data) => Promise
 *   delete: (id) => Promise
 * @param {Function} [options.responseAdapter] - (res) => { items, total }
 * @param {Object} options.defaultForm - 表单默认值
 * @param {Object} [options.formRules] - Element Plus 表单验证规则
 * @param {Function} [options.transformSave] - (form, isEdit) => payload
 *   用于编辑时排除字段（如密码）或转换数据结构
 * @param {string} [options.idKey='id'] - 主键字段名
 * @param {string} [options.successMsg='保存成功']
 * @param {number} [options.pageSize=20]
 * @param {boolean} [options.immediate=true]
 *
 * @returns {Object}
 *   包含 useList 全部返回 + dialogVisible, isEdit, saving, form, formRef,
 *   openDialog, handleSave, handleDelete
 */
export function useCrud(options) {
  const list = useList({
    fetchFn: options.api.list,
    responseAdapter: options.responseAdapter,
    pageSize: options.pageSize,
    immediate: options.immediate,
  });

  const dialogVisible = ref(false);
  const isEdit = ref(false);
  const saving = ref(false);
  const form = ref({ ...options.defaultForm });
  const formRef = ref();

  const idKey = options.idKey || 'id';

  const openDialog = (row = null) => {
    isEdit.value = !!row;
    if (row) {
      form.value = { ...options.defaultForm, ...row };
    } else {
      form.value = { ...options.defaultForm };
    }
    dialogVisible.value = true;
  };

  const handleSave = async () => {
    const valid = await formRef.value?.validate().catch(() => false);
    if (!valid) return;

    saving.value = true;
    try {
      const payload = options.transformSave
        ? options.transformSave(form.value, isEdit.value)
        : { ...form.value };

      if (isEdit.value) {
        await options.api.update(form.value[idKey], payload);
      } else {
        await options.api.create(payload);
      }
      ElMessage.success(options.successMsg || '保存成功');
      dialogVisible.value = false;
      list.fetch();
    } catch (e) {
      const msg = e.message || '保存失败';
      ElMessage.error(msg);
      if (import.meta.env.DEV) {
        console.error('[useCrud] save failed:', e);
      }
    } finally {
      saving.value = false;
    }
  };

  const handleDelete = async (row) => {
    try {
      await ElMessageBox.confirm('确认删除该记录？', '提示', { type: 'warning' });
      await options.api.delete(row[idKey]);
      ElMessage.success('删除成功');
      list.fetch();
    } catch (e) {
      if (e !== 'cancel') {
        ElMessage.error(e.message || '删除失败');
      }
    }
  };

  const crud = reactive({
    dialogVisible,
    isEdit,
    saving,
    form,
    formRef,
    openDialog,
    handleSave,
    handleDelete,
  });
  Object.assign(crud, list);
  return crud;
}
