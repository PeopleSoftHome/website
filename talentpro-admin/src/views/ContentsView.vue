<template>
  <div>
    <h2 style="margin-bottom:20px">{{ t('contents.title') }}</h2>
    <el-card shadow="hover">
      <el-tabs v-model="activeTab">
        <el-tab-pane :label="t('contents.tabProducts')" name="products">
          <el-table :data="products" v-loading="loading" size="default">
            <el-table-column prop="name" :label="t('contents.name')" />
            <el-table-column prop="category" :label="t('contents.category')" width="120" />
            <el-table-column prop="description" :label="t('contents.description')" show-overflow-tooltip />
          </el-table>
        </el-tab-pane>
        <el-tab-pane :label="t('contents.tabIndustries')" name="industries">
          <el-table :data="industries" v-loading="loading" size="default">
            <el-table-column prop="name" :label="t('contents.name')" />
            <el-table-column prop="slug" :label="t('contents.slug')" width="120" />
          </el-table>
        </el-tab-pane>
        <el-tab-pane :label="t('contents.tabResources')" name="resources">
          <el-table :data="resources" v-loading="loading" size="default">
            <el-table-column prop="title" :label="t('contents.titleCol')" />
            <el-table-column prop="type" :label="t('contents.type')" width="100" />
            <el-table-column prop="date" :label="t('contents.date')" width="120" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import client from '@/api/client.js';

const { t } = useI18n();
const activeTab = ref('products');
const loading = ref(false);
const products = ref([]);
const industries = ref([]);
const resources = ref([]);

const fetchData = async () => {
  loading.value = true;
  try {
    const tab = activeTab.value;
    if (tab === 'products') {
      const res = await client.get('/cms/products');
      products.value = res.data ?? [];
    } else if (tab === 'industries') {
      const res = await client.get('/cms/industries');
      industries.value = res.data ?? [];
    } else if (tab === 'resources') {
      const res = await client.get('/cms/resources');
      resources.value = res.data ?? [];
    }
  } catch (e) {
    if (import.meta.env.DEV) {
      console.error(e);
    }
  }
  loading.value = false;
};

watch(activeTab, fetchData, { immediate: true });
</script>
