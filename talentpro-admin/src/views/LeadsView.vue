<!--
  Leads View 组件

  位于: views/LeadsView.vue
-->
<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
      <h2 style="margin:0">{{ t('leads.title') }}</h2>
      <el-button type="primary" size="small" @click="exportLeads" :loading="exporting">
        {{ t('leads.exportExcel') }}
      </el-button>
    </div>
    <el-card shadow="hover">
      <el-table :data="list.items" v-loading="list.loading" size="default" @row-click="openDetail">
        <el-table-column prop="name" :label="t('users.name')" width="100" />
        <el-table-column prop="company" :label="t('users.company')" />
        <el-table-column prop="phone" :label="t('users.phone')" width="130" />
        <el-table-column prop="products" :label="t('leads.product')">
          <template #default="{ row }">
            <el-tag v-for="p in (row.products||[])" :key="p" size="small" style="margin-right:4px">{{ p }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" :label="t('leads.status')" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ t(`leads.statusOptions.${row.status}`) || row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" :label="t('leads.submitTime')" width="160">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column :label="t('common.actions')" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click.stop="openDetail(row)">{{ t('common.detail') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        style="margin-top:16px;justify-content:flex-end"
        layout="prev, pager, next"
        :total="list.total"
        :page-size="list.pageSize"
        v-model:current-page="list.page"
        @current-change="list.fetch"
      />
    </el-card>

    <!-- Lead 详情抽屉 -->
    <el-drawer v-model="drawerVisible" :title="`${t('leads.detail')} — ${selectedLead?.name || ''}`" size="500px">
      <div v-if="selectedLead" v-loading="detailLoading">
        <el-descriptions :column="1" border>
          <el-descriptions-item :label="t('users.name')">{{ selectedLead.name }}</el-descriptions-item>
          <el-descriptions-item :label="t('users.company')">{{ selectedLead.company }}</el-descriptions-item>
          <el-descriptions-item :label="t('users.phone')">{{ selectedLead.phone }}</el-descriptions-item>
          <el-descriptions-item :label="t('users.email')">{{ selectedLead.email || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('leads.companySize')">{{ selectedLead.scale }}</el-descriptions-item>
          <el-descriptions-item :label="t('leads.product')">
            <el-tag v-for="p in (selectedLead.products||[])" :key="p" size="small" style="margin-right:4px">{{ p }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="t('leads.source')">{{ selectedLead.source }}</el-descriptions-item>
          <el-descriptions-item :label="t('leads.ipAddress')">{{ selectedLead.ipAddress || '-' }}</el-descriptions-item>
          <el-descriptions-item :label="t('leads.submitTime')">{{ formatDate(selectedLead.createdAt) }}</el-descriptions-item>
        </el-descriptions>

        <div style="margin-top:24px">
          <h4>{{ t('leads.status') }}</h4>
          <el-radio-group v-model="selectedLead.status" size="small" @change="updateStatus">
            <el-radio-button label="NEW">{{ t('leads.statusOptions.NEW') }}</el-radio-button>
            <el-radio-button label="CONTACTED">{{ t('leads.statusOptions.CONTACTED') }}</el-radio-button>
            <el-radio-button label="QUALIFIED">{{ t('leads.statusOptions.QUALIFIED') }}</el-radio-button>
            <el-radio-button label="DEMOED">{{ t('leads.statusOptions.DEMOED') }}</el-radio-button>
            <el-radio-button label="NEGOTIATION">{{ t('leads.statusOptions.NEGOTIATION') }}</el-radio-button>
            <el-radio-button label="WON">{{ t('leads.statusOptions.WON') }}</el-radio-button>
            <el-radio-button label="LOST">{{ t('leads.statusOptions.LOST') }}</el-radio-button>
          </el-radio-group>
        </div>

        <div style="margin-top:24px">
          <h4>{{ t('leads.followUp') }}</h4>
          <el-timeline v-if="followUps.length">
            <el-timeline-item
              v-for="item in followUps"
              :key="item.id"
              :timestamp="formatDate(item.createdAt)"
              :type="item.type === 'call' ? 'primary' : 'info'"
            >
              <p style="margin:0;font-weight:500">{{ item.type }}</p>
              <p style="margin:4px 0 0;color:var(--admin-text-secondary);font-size:13px">{{ item.content }}</p>
            </el-timeline-item>
          </el-timeline>
          <el-empty v-else :description="t('leads.noRecords')" :image-size="80" />

          <el-form :model="newFollowUp" style="margin-top:16px">
            <el-form-item :label="t('leads.type')" label-width="60px">
              <el-select v-model="newFollowUp.type" size="small" style="width:120px">
                <el-option :label="t('leads.call')" value="call" />
                <el-option :label="t('leads.email')" value="email" />
                <el-option :label="t('leads.wechat')" value="wechat" />
                <el-option :label="t('leads.note')" value="note" />
              </el-select>
            </el-form-item>
            <el-form-item :label="t('leads.content')" label-width="60px">
              <el-input
                v-model="newFollowUp.content"
                type="textarea"
                rows="2"
                :placeholder="t('leads.content') + '...'"
                size="small"
              />
            </el-form-item>
            <el-form-item label-width="60px">
              <el-button type="primary" size="small" @click="addFollowUp" :loading="addingFollowUp">
                {{ t('leads.addFollowUp') }}
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { formatDate } from '@/utils/formatDate';
import { ref, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import client from '@/api/client';
import { useList } from '@/composables/useList';
import { downloadFile } from '@/utils/downloadFile';

const { t } = useI18n();

const list = useList({
  fetchFn: (p) => client.get(`/demo-bookings?page=${p.page}&pageSize=${p.pageSize}`),
});

const drawerVisible = ref(false);
const detailLoading = ref(false);
const selectedLead = ref(null);
const followUps = ref([]);
const addingFollowUp = ref(false);
const exporting = ref(false);
const newFollowUp = reactive({ type: 'call', content: '' });

const openDetail = async (row) => {
  selectedLead.value = row;
  drawerVisible.value = true;
  detailLoading.value = true;
  try {
    const res = await client.get(`/demo-bookings/${row.id}`);
    selectedLead.value = res.data || res;
    followUps.value = selectedLead.value.followUps || [];
  } catch (e) {
    ElMessage.error(t('leads.loadDetailFailed'));
  }
  detailLoading.value = false;
};

const statusType = (s) => {
  const map = {
    NEW: 'info',
    CONTACTED: 'warning',
    QUALIFIED: 'success',
    DEMOED: 'success',
    NEGOTIATION: 'warning',
    WON: 'success',
    LOST: 'danger',
  };
  return map[s] || 'info';
};


const updateStatus = async (status) => {
  try {
    await client.patch(`/demo-bookings/${selectedLead.value.id}`, { status });
    ElMessage.success(t('common.success'));
    list.fetch();
  } catch (e) {
    ElMessage.error(t('common.failed'));
  }
};

const addFollowUp = async () => {
  if (!newFollowUp.content.trim()) {
    ElMessage.warning(t('leads.content'));
    return;
  }
  addingFollowUp.value = true;
  try {
    const res = await client.post(`/demo-bookings/${selectedLead.value.id}/follow-ups`, {
      type: newFollowUp.type,
      content: newFollowUp.content,
      createdBy: 'admin',
    });
    followUps.value.unshift(res.data);
    newFollowUp.content = '';
    ElMessage.success(t('common.success'));
  } catch (e) {
    ElMessage.error(t('common.failed'));
  }
  addingFollowUp.value = false;
};

const exportLeads = async () => {
  exporting.value = true;
  try {
    const res = await client.get('/admin/export/leads?format=xlsx', { responseType: 'blob' });
    const blob = new Blob([res.data], { type: 'application/octet-stream' });
    downloadFile(blob, `leads-${Date.now()}.xlsx`);
    ElMessage.success(t('common.success'));
  } catch (e) {
    if (import.meta.env.DEV) {
      console.error(e);
    }
    ElMessage.error(t('common.failed'));
  }
  exporting.value = false;
};
</script>
