<!--
  Order Manager Status Dialog 组件

  位于: components/order-manager/OrderManagerStatusDialog.vue
-->
<template>
  <el-dialog
    :model-value="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    :title="t('orders.updateOrderStatusDialog')"
    width="500px"
    destroy-on-close
  >
    <el-form :model="form" label-width="100px">
      <el-form-item :label="t('orders.orderNo')">
        <span>{{ form.orderNo }}</span>
      </el-form-item>
      <el-form-item :label="t('orders.currentStatus')">
        <el-tag :type="statusType(form.currentStatus)" size="small">{{ statusLabel(form.currentStatus) }}</el-tag>
      </el-form-item>
      <el-form-item :label="t('orders.newStatus')">
        <el-select
          :model-value="form.status"
          style="width: 100%"
          @update:modelValue="$emit('update:form', { ...form, status: $event })"
        >
          <el-option v-for="(label, key) in statusMap" :key="key" :label="label" :value="key" />
        </el-select>
      </el-form-item>
      <el-form-item :label="t('orders.reason')">
        <el-input
          :model-value="form.reason"
          type="textarea"
          :rows="3"
          :placeholder="t('orders.reasonOptional')"
          @update:modelValue="$emit('update:form', { ...form, reason: $event })"
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
  statusMap: { type: Object, required: true },
  statusType: { type: Function, required: true },
  statusLabel: { type: Function, required: true },
  saving: Boolean,
});

defineEmits(['update:modelValue', 'update:form', 'save']);
</script>
