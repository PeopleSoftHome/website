<template>
  <el-dropdown split-button type="warning" size="small" @click="openGenerate('continue')" @command="handleCommand">
    ✨ AI 助手
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="title">生成标题</el-dropdown-item>
        <el-dropdown-item command="excerpt">生成摘要</el-dropdown-item>
        <el-dropdown-item command="content">续写/润色正文</el-dropdown-item>
        <el-dropdown-item command="seo">生成 SEO</el-dropdown-item>
        <el-dropdown-item command="translate">翻译</el-dropdown-item>
        <el-dropdown-item command="moderate">内容审核</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup>
import { ElMessage } from 'element-plus';

const props = defineProps({
  type: { type: String, default: 'blog' },
  title: { type: String, default: '' },
  content: { type: String, default: '' },
});

const emit = defineEmits(['result']);

const openGenerate = (action) => {
  if (!props.content && !props.title) {
    ElMessage.warning('请先在表单中填写一些内容');
    return;
  }
  emit('result', { action, type: props.type, content: props.content, title: props.title });
};

const handleCommand = (cmd) => openGenerate(cmd);
</script>
