<template>
  <el-dialog
    :model-value="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    :title="t('orders.invoiceDialog')"
    width="500px"
    destroy-on-close
  >
    <el-form :model="form" label-width="100px">
      <el-form-item :label="t('orders.orderNo')">
        <span>{{ form.orderNo }}</span>
      </el-form-item>
      <el-form-item :label="t('orders.isInvoiceRequested')">
        <el-switch
          :model-value="form.invoiceRequested"
          :active-text="t('orders.requested')"
          :inactive-text="t('orders.notRequested')"
          @update:modelValue="$emit('update:form', { ...form, invoiceRequested: $event })"
        />
      </el-form-item>
      <el-form-item :label="t('orders.invoiceNo')">
        <el-input
          :model-value="form.invoiceNo"
          :placeholder="t('orders.invoiceNoOptional')"
          @update:modelValue="$emit('update:form', { ...form, invoiceNo: $event })"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">{{ t('orders.cancel') }}</el-button>
      <el-button type="primary" :loading="saving" @click="$emit('save')">{{ t('orders.save') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

defineProps({
  modelValue: Boolean,
  form: { type: Object, required: true },
  saving: Boolean,
});

defineEmits(['update:modelValue', 'update:form', 'save']);
</script>
