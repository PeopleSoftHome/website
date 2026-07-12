<!--
  Section Config Form 组件

  位于: components/page-config/SectionConfigForm.vue
-->
<template>
  <el-form label-position="top">
    <el-form-item
      v-for="field in schema"
      :key="field.prop"
      :label="fieldLabel(field)"
    >
      <el-input
        v-if="field.type === 'input'"
        v-model="local[field.prop]"
        :placeholder="field.placeholder || ''"
        @change="emitUpdate"
      />
      <el-input
        v-else-if="field.type === 'textarea'"
        v-model="local[field.prop]"
        type="textarea"
        :rows="field.rows || 3"
        :placeholder="field.placeholder || ''"
        @change="emitUpdate"
      />
      <el-switch
        v-else-if="field.type === 'switch'"
        v-model="local[field.prop]"
        @change="emitUpdate"
      />
      <ImageUpload
        v-else-if="field.type === 'image-upload'"
        v-model="local[field.prop]"
        @update:modelValue="onImageChange(field.prop, $event)"
      />
    </el-form-item>
  </el-form>
</template>

<script setup>
import { reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import ImageUpload from '../ui/ImageUpload.vue';

const { t, te } = useI18n();

const props = defineProps({
  schema: { type: Array, required: true },
  modelValue: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['update:modelValue']);

const local = reactive({});

const fieldLabel = (field) => {
  const key = `sectionConfig.fields.${field.prop}`;
  if (te(key)) return t(key);
  return field.label || field.prop;
};

const syncLocal = () => {
  const value = props.modelValue || {};
  props.schema.forEach((field) => {
    const hasDefault = field.default !== undefined;
    local[field.prop] = value[field.prop] !== undefined ? value[field.prop] : (hasDefault ? field.default : '');
  });
};

watch(() => props.modelValue, syncLocal, { immediate: true });

const emitUpdate = () => {
  emit('update:modelValue', { ...local });
};

const onImageChange = (prop, val) => {
  local[prop] = val;
  emitUpdate();
};
</script>
