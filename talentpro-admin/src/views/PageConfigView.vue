<template>
  <div>
    <h2 style="margin-bottom:20px">首页配置管理</h2>

    <el-row :gutter="16">
      <!-- 左侧：CMS 可编辑配置 -->
      <el-col :xs="24" :md="16">
        <el-card shadow="hover" v-loading="loading">
          <template #header>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span>板块排序与启用状态</span>
              <div style="display:flex;gap:8px;align-items:center">
                <el-tag v-if="page?.isPublished" type="success" size="small">已发布</el-tag>
                <el-tag v-else type="warning" size="small">未发布</el-tag>
                <el-button v-if="hasChanges" type="primary" size="small" @click="save" :loading="saving">
                  保存更改
                </el-button>
                <el-button size="small" @click="refresh">刷新</el-button>
              </div>
            </div>
          </template>

          <!-- 无 page -->
          <el-empty v-if="!page" description="暂无首页配置" :image-size="80">
            <el-button type="primary" @click="createDefaultPage" :loading="creating">
              初始化默认首页
            </el-button>
          </el-empty>

          <!-- 有 page 但无 sections -->
          <el-empty v-else-if="sections.length === 0" description="页面已创建，但无 Section 配置" :image-size="80">
            <el-button type="primary" @click="autoCreateSections" :loading="creating">
              生成默认 Section
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
                active-text="启用"
                inactive-text="禁用"
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
                删除
              </el-button>
            </div>
          </div>

          <!-- 添加 Section -->
          <div v-if="page && availableSections.length > 0" style="margin-top:16px;display:flex;gap:8px;align-items:center">
            <el-select v-model="selectedToAdd" placeholder="选择要添加的板块" size="small" style="width:220px">
              <el-option
                v-for="rs in availableSections"
                :key="rs.key"
                :label="rs.title"
                :value="rs.key"
              />
            </el-select>
            <el-button type="primary" size="small" @click="addSection" :disabled="!selectedToAdd">
              添加
            </el-button>
          </div>
        </el-card>

        <!-- Page 元信息 -->
        <el-card shadow="hover" style="margin-top:16px" v-if="page">
          <template #header>
            <span>页面元信息</span>
          </template>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="Slug">{{ page.slug }}</el-descriptions-item>
            <el-descriptions-item label="标题">{{ page.title }}</el-descriptions-item>
            <el-descriptions-item label="Meta Title">{{ page.metaTitle || '-' }}</el-descriptions-item>
            <el-descriptions-item label="Meta Desc">{{ page.metaDesc || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>

      <!-- 右侧：插件注册表 -->
      <el-col :xs="24" :md="8" style="margin-top:16px">
        <el-card shadow="hover">
          <template #header>
            <span>前端插件注册表（{{ REGISTERED_SECTIONS.length }} 个）</span>
          </template>

          <el-table :data="REGISTERED_SECTIONS" size="small" :border="true">
            <el-table-column label="key" width="110" prop="key" />
            <el-table-column label="名称" prop="title" />
            <el-table-column label="CMS 中" width="70" align="center">
              <template #default="{ row }">
                <el-tag :type="isInCms(row.key) ? 'success' : 'info'" size="small">
                  {{ isInCms(row.key) ? '✓' : '-' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>

          <el-alert title="提示" type="info" :closable="false" style="margin-top:16px">
            <p style="margin:0;font-size:13px;line-height:1.6">
              • 拖拽左侧列表可调整板块渲染顺序<br>
              • 关闭开关可禁用板块（不会删除数据）<br>
              • 未在 CMS 中注册的板块，前端将跳过渲染<br>
              • 修改后点击「保存更改」才会生效
            </p>
          </el-alert>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Rank } from '@element-plus/icons-vue';
import client from '@/api/client.js';
import { REGISTERED_SECTIONS } from '@/data/sectionRegistry.js';

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
    ElMessage.success('保存成功');
    hasChanges.value = false;
    fetchPage();
  } catch (e) {
    ElMessage.error(e?.response?.data?.message || e.message || '保存失败');
  }
  saving.value = false;
};

const removeSection = async (i) => {
  const s = sections.value[i];
  try {
    await ElMessageBox.confirm(`确认删除「${s.title}」板块？`, '提示', { type: 'warning' });
    await client.delete(`/cms/sections/${s.id}`);
    sections.value.splice(i, 1);
    ElMessage.success('已删除');
    hasChanges.value = true;
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error(e?.response?.data?.message || e.message || '删除失败');
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
    ElMessage.success('添加成功');
    selectedToAdd.value = '';
    fetchPage();
  } catch (e) {
    ElMessage.error(e?.response?.data?.message || e.message || '添加失败');
  }
};

const createDefaultPage = async () => {
  creating.value = true;
  try {
    await client.post('/cms/pages', {
      slug: 'home',
      title: '首页',
      metaTitle: 'TalentPro — 用 AI 重新定义人才管理',
      metaDesc: 'TalentPro 为中大型企业提供一体化 HR SaaS 解决方案',
    });
    ElMessage.success('默认首页配置已创建');
    await fetchPage();
    // 自动创建默认 sections
    if (page.value && sections.value.length === 0) {
      await autoCreateSections();
    }
  } catch (e) {
    ElMessage.error(e?.response?.data?.message || e.message || '创建失败');
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
    ElMessage.success('默认 Section 已生成');
    fetchPage();
  } catch (e) {
    ElMessage.error(e?.response?.data?.message || e.message || '生成失败');
  }
  creating.value = false;
};

const refresh = () => {
  fetchPage();
  ElMessage.success('已刷新');
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
