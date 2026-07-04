<template>
  <div>
    <h2 style="margin-top: 0">{{ t('translations.title') }}</h2>
    <p style="color: var(--admin-text-secondary); margin-bottom: 16px">
      {{ t('translations.description') }}
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
import { useI18n } from 'vue-i18n';
import CmsTable from '@/components/CmsTable.vue';

const { t } = useI18n();

const columns = [
  { prop: 'locale', label: t('translations.locale'), width: 100 },
  { prop: 'key', label: t('translations.key'), minWidth: 200 },
  { prop: 'value', label: t('translations.value'), minWidth: 280 },
  { prop: 'context', label: t('translations.context'), width: 140 },
];

const formFields = [
  { prop: 'locale', label: t('translations.locale'), type: 'input', placeholder: t('translations.localePlaceholder') },
  { prop: 'key', label: t('translations.key'), type: 'input', placeholder: t('translations.keyPlaceholder') },
  { prop: 'value', label: t('translations.value'), type: 'textarea', rows: 4, placeholder: t('translations.valuePlaceholder') },
  { prop: 'context', label: t('translations.context'), type: 'input', placeholder: t('translations.contextPlaceholder') },
];

const rules = {
  locale: [{ required: true, message: t('translations.localeRequired'), trigger: 'blur' }],
  key: [{ required: true, message: t('translations.keyRequired'), trigger: 'blur' }],
  value: [{ required: true, message: t('translations.valueRequired'), trigger: 'blur' }],
};
</script>
