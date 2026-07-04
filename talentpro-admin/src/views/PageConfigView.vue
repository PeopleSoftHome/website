<template>
  <div>
    <h2 style="margin-bottom:20px">{{ t('pageConfig.title') }}</h2>

    <el-row :gutter="16">
      <!-- 左侧：CMS 可编辑配置 -->
      <el-col :xs="24" :md="16">
        <el-card shadow="hover" v-loading="loading">
          <template #header>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span>{{ t('pageConfig.sectionSortAndStatus') }}</span>
              <div style="display:flex;gap:8px;align-items:center">
                <el-tag v-if="page?.isPublished" type="success" size="small">{{ t('pageConfig.published') }}</el-tag>
                <el-tag v-else type="warning" size="small">{{ t('pageConfig.unpublished') }}</el-tag>
                <el-button v-if="hasChanges" type="primary" size="small" @click="save" :loading="saving">
                  {{ t('pageConfig.saveChanges') }}
                </el-button>
                <el-button size="small" @click="refresh">{{ t('pageConfig.refresh') }}</el-button>
              </div>
            </div>
          </template>

          <!-- 无 page -->
          <el-empty v-if="!page" :description="t('pageConfig.noPageConfig')" :image-size="80">
            <el-button type="primary" @click="createDefaultPage" :loading="creating">
              {{ t('pageConfig.initDefaultHome') }}
            </el-button>
          </el-empty>

          <!-- 有 page 但无 sections -->
          <el-empty v-else-if="sections.length === 0" :description="t('pageConfig.pageCreatedNoSections')" :image-size="80">
            <el-button type="primary" @click="autoCreateSections" :loading="creating">
              {{ t('pageConfig.generateDefaultSections') }}
            </el-button>
          </el-empty>

          <!-- Section 拖拽列表 -->
          <div v-else class="section-list">
            <div
              v-for="(s, i) in sections"
              :key="s.id"
              class="section-item"
              :class="{ 'is-inactive': !s.isActive, 'is-dragging': dragIndex === i }"
              draggable="true"
              @dragstart="onDragStart($event, i)"
              @dragover.prevent="onDragOver($event, i)"
              @drop="onDrop($event, i)"
              @dragend="onDragEnd"
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
                v-model="s.isActive"
                size="small"
                inline-prompt
                :active-text="t('pageConfig.enable')"
                :inactive-text="t('pageConfig.disable')"
                style="margin-left:auto"
                @change="hasChanges = true"
              />
              <el-button
                type="danger"
                size="small"
                text
                style="margin-left:8px"
                @click="removeSection(i)"
              >
                {{ t('pageConfig.delete') }}
              </el-button>
            </div>
          </div>

          <!-- 添加 Section -->
          <div v-if="page && availableSections.length > 0" style="margin-top:16px;display:flex;gap:8px;align-items:center">
            <el-select v-model="selectedToAdd" :placeholder="t('pageConfig.selectSection')" size="small" style="width:220px">
              <el-option
                v-for="rs in availableSections"
                :key="rs.key"
                :label="rs.title"
                :value="rs.key"
              />
            </el-select>
            <el-button type="primary" size="small" @click="addSection" :disabled="!selectedToAdd">
              {{ t('pageConfig.add') }}
            </el-button>
          </div>
        </el-card>

        <!-- Page 元信息 -->
        <el-card shadow="hover" style="margin-top:16px" v-if="page">
          <template #header>
            <span>{{ t('pageConfig.pageMeta') }}</span>
          </template>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item :label="t('pageConfig.slug')">{{ page.slug }}</el-descriptions-item>
            <el-descriptions-item :label="t('pageConfig.pageTitle')">{{ page.title }}</el-descriptions-item>
            <el-descriptions-item :label="t('pageConfig.metaTitle')">{{ page.metaTitle || '-' }}</el-descriptions-item>
            <el-descriptions-item :label="t('pageConfig.metaDesc')">{{ page.metaDesc || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>

      <!-- 右侧：插件注册表 -->
      <el-col :xs="24" :md="8" style="margin-top:16px">
        <el-card shadow="hover">
          <template #header>
            <span>{{ t('pageConfig.registryCount', { count: REGISTERED_SECTIONS.length }) }}</span>
          </template>

          <el-table :data="REGISTERED_SECTIONS" size="small" :border="true">
            <el-table-column :label="t('pageConfig.key')" width="110" prop="key" />
            <el-table-column :label="t('pageConfig.name')" prop="title" />
            <el-table-column :label="t('pageConfig.inCms')" width="70" align="center">
              <template #default="{ row }">
                <el-tag :type="isInCms(row.key) ? 'success' : 'info'" size="small">
                  {{ isInCms(row.key) ? t('pageConfig.yes') : t('pageConfig.no') }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>

          <el-alert :title="t('pageConfig.tip')" type="info" :closable="false" style="margin-top:16px">
            <p style="margin:0;font-size:13px;line-height:1.6">
              • {{ t('pageConfig.dragHint') }}<br>
              • {{ t('pageConfig.disableHint') }}<br>
              • {{ t('pageConfig.skipHint') }}<br>
              • {{ t('pageConfig.saveToTakeEffect') }}
            </p>
          </el-alert>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Rank } from '@element-plus/icons-vue';
import client from '@/api/client.js';
import { REGISTERED_SECTIONS } from '@/data/sectionRegistry.js';

const { t } = useI18n();

const page = ref(null);
const sections = ref([]);
const loading = ref(false);
const saving = ref(false);
const creating = ref(false);
const hasChanges = ref(false);
const selectedToAdd = ref('');
const dragIndex = ref(-1);

const isInCms = (key) => sections.value.some((s) => s.key === key);

const availableSections = computed(() =>
  REGISTERED_SECTIONS.filter((rs) => !isInCms(rs.key)),
);

const fetchPage = async () => {
  loading.value = true;
  try {
    const res = await client.get('/cms/pages/home');
    page.value = res.data || null;
    normalizeSections();
  } catch (e) {
    page.value = null;
    sections.value = [];
  }
  hasChanges.value = false;
  loading.value = false;
};

const normalizeSections = () => {
  const raw = page.value?.sections || [];
  sections.value = raw
    .map((s) => {
      const reg = REGISTERED_SECTIONS.find((r) => r.key === s.type);
      return {
        id: s.id,
        key: s.type,
        title: reg?.title || s.type,
        isActive: s.isActive !== false,
        sortOrder: s.sortOrder ?? 0,
        config: s.config || {},
        isUnknown: !reg,
      };
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);
};

// ─── Drag & Drop ───
const onDragStart = (e, i) => {
  dragIndex.value = i;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', String(i));
};

const onDragOver = (e, i) => {
  e.dataTransfer.dropEffect = 'move';
};

const onDrop = (e, i) => {
  const from = Number(e.dataTransfer.getData('text/plain'));
  if (from === i || Number.isNaN(from)) return;
  const item = sections.value.splice(from, 1)[0];
  sections.value.splice(i, 0, item);
  hasChanges.value = true;
  dragIndex.value = -1;
};

const onDragEnd = () => {
  dragIndex.value = -1;
};

// ─── CRUD ───
const save = async () => {
  saving.value = true;
  try {
    const payload = sections.value.map((s, i) => ({
      id: s.id,
      sortOrder: i,
      isActive: s.isActive,
    }));
    await client.post('/cms/sections/batch', { sections: payload });
    ElMessage.success(t('pageConfig.saveSuccess'));
    hasChanges.value = false;
    fetchPage();
  } catch (e) {
    ElMessage.error(e?.response?.data?.message || e.message || t('pageConfig.saveFailed'));
  }
  saving.value = false;
};

const removeSection = async (i) => {
  const s = sections.value[i];
  try {
    await ElMessageBox.confirm(t('pageConfig.deleteConfirm', { title: s.title }), t('pageConfig.deleteTip'), { type: 'warning' });
    await client.delete(`/cms/sections/${s.id}`);
    sections.value.splice(i, 1);
    ElMessage.success(t('pageConfig.deleted'));
    hasChanges.value = true;
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error(e?.response?.data?.message || e.message || t('pageConfig.deleteFailed'));
    }
  }
};

const addSection = async () => {
  if (!selectedToAdd.value || !page.value) return;
  const reg = REGISTERED_SECTIONS.find((r) => r.key === selectedToAdd.value);
  try {
    await client.post('/cms/sections', {
      pageId: page.value.id,
      type: selectedToAdd.value,
      sortOrder: sections.value.length,
      config: reg?.defaultConfig || {},
      isActive: true,
    });
    ElMessage.success(t('pageConfig.addSuccess'));
    selectedToAdd.value = '';
    fetchPage();
  } catch (e) {
    ElMessage.error(e?.response?.data?.message || e.message || t('pageConfig.addFailed'));
  }
};

const createDefaultPage = async () => {
  creating.value = true;
  try {
    await client.post('/cms/pages', {
      slug: 'home',
      title: t('pageConfig.defaults.pageTitle'),
      metaTitle: t('pageConfig.defaults.metaTitle'),
      metaDesc: t('pageConfig.defaults.metaDesc'),
    });
    ElMessage.success(t('pageConfig.defaultHomeCreated'));
    await fetchPage();
    // 自动创建默认 sections
    if (page.value && sections.value.length === 0) {
      await autoCreateSections();
    }
  } catch (e) {
    ElMessage.error(e?.response?.data?.message || e.message || t('pageConfig.createFailed'));
  }
  creating.value = false;
};

const autoCreateSections = async () => {
  if (!page.value) return;
  creating.value = true;
  try {
    for (let i = 0; i < REGISTERED_SECTIONS.length; i++) {
      const rs = REGISTERED_SECTIONS[i];
      await client.post('/cms/sections', {
        pageId: page.value.id,
        type: rs.key,
        sortOrder: i,
        config: rs.defaultConfig || {},
        isActive: true,
      });
    }
    ElMessage.success(t('pageConfig.defaultSectionsGenerated'));
    fetchPage();
  } catch (e) {
    ElMessage.error(e?.response?.data?.message || e.message || t('pageConfig.generateFailed'));
  }
  creating.value = false;
};

const refresh = () => {
  fetchPage();
  ElMessage.success(t('pageConfig.refreshed'));
};

onMounted(fetchPage);
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
