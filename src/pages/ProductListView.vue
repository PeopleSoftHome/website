<template>
  <div>

    <main :class="s.page">
      <div class="container">
        <Breadcrumb :items="[{ label: t('productPage.title'), to: '/products' }]" />

        <div :class="s.hero">
          <h1 :class="s.title">{{ t('productPage.title') }}</h1>
          <p :class="s.subtitle">{{ t('productPage.subtitle') }}</p>
        </div>

        <div :class="s.tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="[s.tab, activeTab === tab.id ? s.tabActive : '']"
            @click="activeTab = tab.id"
          >
            {{ tab.name }}
          </button>
        </div>

        <div :class="s.grid">
          <router-link
            v-for="product in filteredProducts"
            :key="product.id"
            :to="`/products/${product.slug}`"
            :class="s.card"
          >
            <div :class="s.cardTop">
              <div :class="s.cardIcon" :style="{ background: product.iconBg || 'var(--primary-light)', color: product.iconColor || 'var(--primary)' }">
                <component :is="product.icon" v-if="product.icon" />
                <span v-else>{{ product.name.charAt(0) }}</span>
              </div>
              <span v-if="product.tabLabel" :class="s.cardTabLabel">{{ product.tabLabel }}</span>
            </div>
            <h3 :class="s.cardTitle">{{ product.name }}</h3>
            <p :class="s.cardTagline">{{ product.tagline }}</p>
            <p :class="s.cardDesc">{{ (product.desc || '').slice(0, 80) }}...</p>
            <div :class="s.cardFooter">
              <span :class="s.cardCta">{{ t('productPage.learnMore') }} →</span>
            </div>
          </router-link>
        </div>

        <div :class="s.ctaBand">
          <h3 :class="s.ctaTitle">{{ t('productPage.ctaTitle') }}</h3>
          <p :class="s.ctaDesc">{{ t('productPage.ctaDesc') }}</p>
          <button :class="s.ctaBtn" @click="modalStore.openModal()">{{ t('productPage.demoCta') }}</button>
        </div>
      </div>
    </main>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, inject } from 'vue';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb.vue';
import { PRODUCT_TABS } from '@/data/products.js';
import { injectJsonLd, removeJsonLd } from '@/utils/jsonld.js';
import s from './ProductListView.module.css';

const { t } = inject('i18n', { t: (k) => k });
const modalStore = inject('modal', { openModal: () => {} });

const tabs = [{ id: 'all', name: t('productPage.all') || '全部' }, ...PRODUCT_TABS.map((tab) => ({ id: tab.id, name: tab.label }))];
const activeTab = ref('all');

const allProducts = computed(() => {
  const list = [];
  PRODUCT_TABS.forEach((tab) => {
    tab.products.forEach((p) => {
      list.push({ ...p, tabId: tab.id, tabLabel: tab.label, iconBg: tab.iconBg, iconColor: tab.iconColor });
    });
  });
  return list;
});

const filteredProducts = computed(() => {
  if (activeTab.value === 'all') return allProducts.value;
  return allProducts.value.filter((p) => p.tabId === activeTab.value);
});

onMounted(() => {
  injectJsonLd({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'TalentPro 产品矩阵',
    itemListElement: allProducts.value.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.name,
      description: p.tagline,
    })),
  });
});
onUnmounted(removeJsonLd);
</script>
