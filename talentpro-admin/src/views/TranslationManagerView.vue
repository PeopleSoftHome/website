<template>
  <div>
    <h2 style="margin-top: 0">翻译管理</h2>
    <p style="color: var(--admin-text-secondary); margin-bottom: 16px">
      管理 CMS 多语言文案覆盖层。同一 key 在后端会覆盖前端 i18n JSON 的默认值。
    </p>

    <CmsTable
      api-url="/cms/translations"
      :columns="columns"
      :form-fields="formFields"
      :rules="rules"
      :page-size="20"
    />
  </div>
</template>

<script setup>
import CmsTable from '@/components/CmsTable.vue';

const columns = [
  { prop: 'locale', label: '语言', width: 100 },
  { prop: 'key', label: 'Key', minWidth: 200 },
  { prop: 'value', label: '文案', minWidth: 280 },
  { prop: 'context', label: '上下文', width: 140 },
];

const formFields = [
  { prop: 'locale', label: '语言', type: 'input', placeholder: '如 zh / en / zh-TW' },
  { prop: 'key', label: 'Key', type: 'input', placeholder: '如 nav.demo' },
  { prop: 'value', label: '文案', type: 'textarea', rows: 4, placeholder: '翻译内容' },
  { prop: 'context', label: '上下文', type: 'input', placeholder: '可选，如 nav' },
];

const rules = {
  locale: [{ required: true, message: '请输入语言代码', trigger: 'blur' }],
  key: [{ required: true, message: '请输入 Key', trigger: 'blur' }],
  value: [{ required: true, message: '请输入文案', trigger: 'blur' }],
};
</script>
