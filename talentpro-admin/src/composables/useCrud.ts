/**
 * use Crud 模块
 *
 * 位于: composables/useCrud.ts
 */
import { ref, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useList } from './useList';

export interface CrudApi<F> {
  list: (params: Record<string, unknown>) => Promise<unknown>;
  create: (data: Partial<F>) => Promise<unknown>;
  update: (id: string | number, data: Partial<F>) => Promise<unknown>;
  delete: (id: string | number) => Promise<unknown>;
}

export interface UseCrudOptions<F extends Record<string, unknown>> {
  api: CrudApi<F>;
  responseAdapter?: (res: unknown) => { items: F[]; total: number };
  defaultForm: F;
  formRules?: Record<string, unknown>;
  transformSave?: (form: F, isEdit: boolean) => Partial<F>;
  idKey?: keyof F & string;
  successMsg?: string;
  pageSize?: number;
  immediate?: boolean;
}

/**
 * 通用 CRUD 状态管理 Composable（基于 useList）
 *
 * @returns useList 全部返回 + dialogVisible, isEdit, saving, form, formRef,
 *   openDialog, handleSave, handleDelete
 */
export function useCrud<F extends Record<string, unknown> = Record<string, unknown>>(
  options: UseCrudOptions<F>,
) {
  const list = useList<F>({
    fetchFn: options.api.list,
    responseAdapter: options.responseAdapter,
    pageSize: options.pageSize,
    immediate: options.immediate,
  });

  const dialogVisible = ref(false);
  const isEdit = ref(false);
  const saving = ref(false);
  const form = ref<F>({ ...options.defaultForm });
  const formRef = ref<{ validate: () => Promise<boolean> } | null>(null);

  const idKey = options.idKey || ('id' as keyof F & string);

  const openDialog = (row: F | null = null): void => {
    isEdit.value = !!row;
    if (row) {
      form.value = { ...options.defaultForm, ...row };
    } else {
      form.value = { ...options.defaultForm };
    }
    dialogVisible.value = true;
  };

  const handleSave = async (): Promise<void> => {
    const valid = await formRef.value?.validate().catch(() => false);
    if (!valid) return;

    saving.value = true;
    try {
      const payload = options.transformSave
        ? options.transformSave(form.value, isEdit.value)
        : { ...form.value };

      if (isEdit.value) {
        await options.api.update(form.value[idKey] as unknown as string | number, payload);
      } else {
        await options.api.create(payload);
      }
      ElMessage.success(options.successMsg || '保存成功');
      dialogVisible.value = false;
      list.fetch();
    } catch (e) {
      const msg = (e as Error).message || '保存失败';
      ElMessage.error(msg);
      if (import.meta.env.DEV) {
        console.error('[useCrud] save failed:', e);
      }
    } finally {
      saving.value = false;
    }
  };

  const handleDelete = async (row: F): Promise<void> => {
    try {
      await ElMessageBox.confirm('确认删除该记录？', '提示', { type: 'warning' });
      await options.api.delete(row[idKey] as unknown as string | number);
      ElMessage.success('删除成功');
      list.fetch();
    } catch (e) {
      if (e !== 'cancel') {
        ElMessage.error((e as Error).message || '删除失败');
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
