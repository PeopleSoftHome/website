<template>
  <div class="rich-editor">
    <div class="toolbar">
      <el-button-group>
        <el-button :type="isActive('bold') ? 'primary' : 'default'" @click="toggleBold" size="small">B</el-button>
        <el-button :type="isActive('italic') ? 'primary' : 'default'" @click="toggleItalic" size="small">I</el-button>
      </el-button-group>
      <el-button-group>
        <el-button :type="isActive('heading', { level: 1 }) ? 'primary' : 'default'" @click="toggleHeading(1)" size="small">H1</el-button>
        <el-button :type="isActive('heading', { level: 2 }) ? 'primary' : 'default'" @click="toggleHeading(2)" size="small">H2</el-button>
        <el-button :type="isActive('heading', { level: 3 }) ? 'primary' : 'default'" @click="toggleHeading(3)" size="small">H3</el-button>
      </el-button-group>
      <el-button-group>
        <el-button :type="isActive('bulletList') ? 'primary' : 'default'" @click="toggleBulletList" size="small">
          <el-icon><List /></el-icon>
        </el-button>
        <el-button :type="isActive('orderedList') ? 'primary' : 'default'" @click="toggleOrderedList" size="small">1.</el-button>
      </el-button-group>
      <el-button-group>
        <el-button :type="isActive('blockquote') ? 'primary' : 'default'" @click="toggleBlockquote" size="small">"</el-button>
        <el-button :type="isActive('codeBlock') ? 'primary' : 'default'" @click="toggleCodeBlock" size="small">&lt;/&gt;</el-button>
      </el-button-group>
    </div>
    <editor-content :editor="editor" class="editor-content" />
  </div>
</template>

<script setup>
import { watch } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '请输入内容...' },
});

const emit = defineEmits(['update:modelValue']);

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Placeholder.configure({ placeholder: props.placeholder }),
  ],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML());
  },
});

watch(() => props.modelValue, (val) => {
  if (editor.value && editor.value.getHTML() !== val) {
    editor.value.commands.setContent(val, false);
  }
});

const isActive = (name, options = {}) => {
  return editor.value?.isActive(name, options) || false;
};

const toggleBold = () => editor.value?.chain().focus().toggleBold().run();
const toggleItalic = () => editor.value?.chain().focus().toggleItalic().run();
const toggleHeading = (level) => editor.value?.chain().focus().toggleHeading({ level }).run();
const toggleBulletList = () => editor.value?.chain().focus().toggleBulletList().run();
const toggleOrderedList = () => editor.value?.chain().focus().toggleOrderedList().run();
const toggleBlockquote = () => editor.value?.chain().focus().toggleBlockquote().run();
const toggleCodeBlock = () => editor.value?.chain().focus().toggleCodeBlock().run();
</script>

<style scoped>
.rich-editor {
  border: 1px solid var(--admin-border-base);
  border-radius: 4px;
  overflow: hidden;
}
.toolbar {
  padding: 8px;
  border-bottom: 1px solid var(--admin-border-lighter);
  background: var(--admin-bg-base);
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.editor-content {
  padding: 12px;
  min-height: 200px;
  background: var(--admin-white);
}
.editor-content :deep(.ProseMirror) {
  outline: none;
  min-height: 200px;
}
.editor-content :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: var(--admin-text-placeholder);
  pointer-events: none;
  height: 0;
}
.editor-content :deep(.ProseMirror h1) { font-size: 24px; font-weight: 700; margin: 12px 0; }
.editor-content :deep(.ProseMirror h2) { font-size: 20px; font-weight: 700; margin: 10px 0; }
.editor-content :deep(.ProseMirror h3) { font-size: 18px; font-weight: 700; margin: 8px 0; }
.editor-content :deep(.ProseMirror ul) { padding-left: 20px; list-style: disc; }
.editor-content :deep(.ProseMirror ol) { padding-left: 20px; list-style: decimal; }
.editor-content :deep(.ProseMirror blockquote) { border-left: 4px solid var(--admin-border-base); padding-left: 12px; margin: 8px 0; color: var(--admin-text-regular); }
.editor-content :deep(.ProseMirror pre) { background: var(--admin-bg-base); padding: 12px; border-radius: 4px; font-family: monospace; }
</style>
