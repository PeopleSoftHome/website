<!--
  Page Config Section List 组件

  位于: components/page-config/PageConfigSectionList.vue
-->
<template>
  <div class="section-list">
    <div
      v-for="(s, i) in sections"
      :key="s.id"
      class="section-item"
      :class="{ 'is-inactive': !s.isActive, 'is-dragging': dragIndex === i }"
      draggable="true"
      @dragstart="$emit('drag-start', $event, i)"
      @dragover.prevent="$emit('drag-over', $event, i)"
      @drop="$emit('drop', $event, i)"
      @dragend="$emit('drag-end')"
    >
      <el-icon class="drag-handle"><Rank /></el-icon>
      <span class="section-index">{{ i + 1 }}</span>
      <span class="section-title" :class="{ 'is-unknown': s.isUnknown }">
        {{ s.title }}
      </span>
      <el-tag size="small" :type="s.isUnknown ? 'danger' : 'primary'" effect="plain">
        {{ s.key }}
      </el-tag>
      <el-switch
        :model-value="s.isActive"
        size="small"
        inline-prompt
        :active-text="t('pageConfig.enable')"
        :inactive-text="t('pageConfig.disable')"
        style="margin-left:auto"
        @change="$emit('toggle', { index: i, value: $event })"
      />
      <el-button
        v-if="getSectionConfigSchema(s.key).length"
        type="primary"
        size="small"
        text
        style="margin-left:8px"
        @click="$emit('config', s)"
      >
        {{ t('pageConfig.configure') }}
      </el-button>
      <el-button
        type="danger"
        size="small"
        text
        style="margin-left:8px"
        @click="$emit('remove', i)"
      >
        {{ t('pageConfig.delete') }}
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { Rank } from '@element-plus/icons-vue';
import { getSectionConfigSchema } from '@/data/sectionRegistry.js';

const { t } = useI18n();

defineProps({
  sections: { type: Array, required: true },
  dragIndex: { type: Number, default: -1 },
});

defineEmits(['toggle', 'config', 'remove', 'drag-start', 'drag-over', 'drop', 'drag-end']);
</script>

<style scoped>
.section-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid var(--admin-border-light);
  border-radius: 6px;
  background: var(--admin-white);
  cursor: move;
  transition: background 0.15s, box-shadow 0.15s;
}

.section-item:hover {
  background: var(--admin-bg-base);
}

.section-item.is-dragging {
  opacity: 0.5;
  box-shadow: 0 4px 12px var(--admin-black-alpha-10);
}

.section-item.is-inactive {
  opacity: 0.6;
  background: var(--admin-bg-overlay);
}

.drag-handle {
  color: var(--admin-text-secondary);
  cursor: grab;
}

.section-index {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--admin-color-primary-light-1);
  color: var(--admin-color-primary);
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  min-width: 100px;
}

.section-title.is-unknown {
  color: var(--admin-color-danger);
  text-decoration: line-through;
}
</style>
