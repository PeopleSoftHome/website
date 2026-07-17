<!--
  Page Config View 组件

  位于: views/PageConfigView.vue
-->
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
          <PageConfigSectionList
            v-else
            :sections="sections"
            :drag-index="dragIndex"
            @toggle="onToggle"
            @config="openConfigDialog"
            @remove="removeSection"
            @drag-start="onDragStart"
            @drag-over="onDragOver"
            @drop="onDrop"
            @drag-end="onDragEnd"
          />

          <!-- Section 配置弹窗 -->
          <el-dialog v-model="configDialogVisible" :title="configDialogTitle" width="600px" destroy-on-close>
            <SectionConfigForm v-model="editingConfig" :schema="editingSchema" />
            <template #footer>
              <el-button @click="configDialogVisible = false">{{ t('common.cancel') }}</el-button>
              <el-button type="primary" :loading="savingConfig" @click="saveConfig">{{ t('common.save') }}</el-button>
            </template>
          </el-dialog>

          <!-- 添加 Section -->
          <PageConfigAddSection
            v-if="page && availableSections.length > 0"
            :available-sections="availableSections"
            @add="addSection"
          />
        </el-card>

        <!-- Page 元信息 -->
        <PageConfigMetaCard v-if="page" :page="page" />
      </el-col>

      <!-- 右侧：AI 配置助手 + 插件注册表 -->
      <el-col :xs="24" :md="8" style="margin-top:16px">
        <PageConfigAiPanel
          :page="page"
          :sections="sections"
          @apply-image="onApplyAiImage"
          @apply-copy="onApplyAiCopy"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox } from 'element-plus';
import client from '@/api/client';
import { REGISTERED_SECTIONS, getSectionConfigSchema } from '@/data/sectionRegistry.js';
import SectionConfigForm from '@/components/page-config/SectionConfigForm.vue';
import PageConfigSectionList from '@/components/page-config/PageConfigSectionList.vue';
import PageConfigAddSection from '@/components/page-config/PageConfigAddSection.vue';
import PageConfigMetaCard from '@/components/page-config/PageConfigMetaCard.vue';
import PageConfigAiPanel from '@/components/page-config/PageConfigAiPanel.vue';

const { t } = useI18n();

const page = ref(null);
const sections = ref([]);
const loading = ref(false);
const saving = ref(false);
const creating = ref(false);
const hasChanges = ref(false);
const dragIndex = ref(-1);

const configDialogVisible = ref(false);
const savingConfig = ref(false);
const editingSection = ref(null);
const editingConfig = ref({});
const editingSchema = ref([]);
const configDialogTitle = computed(() =>
  editingSection.value ? t('pageConfig.configureTitle', { title: editingSection.value.title }) : t('pageConfig.configure'),
);

const availableSections = computed(() =>
  REGISTERED_SECTIONS.filter((rs) => !sections.value.some((s) => s.key === rs.key)),
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

const addSection = async (key) => {
  if (!key || !page.value) return;
  const reg = REGISTERED_SECTIONS.find((r) => r.key === key);
  try {
    await client.post('/cms/sections', {
      pageId: page.value.id,
      type: key,
      sortOrder: sections.value.length,
      config: reg?.defaultConfig || {},
      isActive: true,
    });
    ElMessage.success(t('pageConfig.addSuccess'));
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

const openConfigDialog = (s) => {
  editingSection.value = s;
  editingSchema.value = getSectionConfigSchema(s.key);
  editingConfig.value = { ...(s.config || {}) };
  configDialogVisible.value = true;
};

const saveConfig = async () => {
  if (!editingSection.value) return;
  savingConfig.value = true;
  try {
    await client.patch(`/cms/sections/${editingSection.value.id}`, { config: editingConfig.value });
    ElMessage.success(t('pageConfig.saveConfigSuccess'));
    configDialogVisible.value = false;
    fetchPage();
  } catch (e) {
    ElMessage.error(e?.response?.data?.message || e.message || t('pageConfig.saveConfigFailed'));
  }
  savingConfig.value = false;
};

const onToggle = ({ index, value }) => {
  sections.value[index].isActive = value;
  hasChanges.value = true;
};

const onApplyAiImage = (url) => {
  const hero = sections.value.find((s) => s.key === 'hero');
  if (!hero) {
    ElMessage.warning(t('pageConfig.noHeroSection'));
    return;
  }
  editingSection.value = hero;
  editingSchema.value = getSectionConfigSchema('hero');
  editingConfig.value = { ...(hero.config || {}), backgroundImage: url };
  configDialogVisible.value = true;
  ElMessage.info(t('pageConfig.aiImageAppliedToHero'));
};

const onApplyAiCopy = ({ field, value }) => {
  const hero = sections.value.find((s) => s.key === 'hero');
  if (!hero) {
    ElMessage.warning(t('pageConfig.noHeroSection'));
    return;
  }
  editingSection.value = hero;
  editingSchema.value = getSectionConfigSchema('hero');
  editingConfig.value = { ...(hero.config || {}), [field]: value };
  configDialogVisible.value = true;
  ElMessage.info(t('pageConfig.aiCopyAppliedToHero'));
};

onMounted(fetchPage);
</script>
