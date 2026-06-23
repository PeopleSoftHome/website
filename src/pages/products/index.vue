<template>
  <div>

    <main :class="s.page">
      <div class="container">
        <Breadcrumb :items="[{ label: t('productPage.title'), to: '/products' }]" />

        <div :class="s.hero" class="reveal">
          <h1 :class="s.title">{{ t('productPage.title') }}</h1>
          <p :class="s.subtitle">{{ t('productPage.subtitle') }}</p>
        </div>

        <div :class="s.tabs" class="reveal reveal-delay-1">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="[s.tab, activeTab === tab.id ? s.tabActive : '']"
            @click="activeTab = tab.id"
          >
            {{ tab.name }}
          </button>
        </div>

        <div :class="s.grid" class="reveal reveal-delay-2">
          <NuxtLink
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
          </NuxtLink>
        </div>

        <div :class="s.ctaBand" class="reveal">
          <h3 :class="s.ctaTitle">{{ t('productPage.ctaTitle') }}</h3>
          <p :class="s.ctaDesc">{{ t('productPage.ctaDesc') }}</p>
          <button :class="s.ctaBtn" @click="modalStore.openModal()">{{ t('productPage.demoCta') }}</button>
        </div>
      </div>
    </main>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ title: 'productPage.title', description: 'productPage.subtitle' });
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useModalStore } from '@/stores/modal.pinia';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb.vue';
import { PRODUCT_TABS } from '@/data/products';
import { injectJsonLd, removeJsonLd } from '@/utils/jsonld';
import s from './index.module.css';

const { t } = useI18n();
const modalStore = useModalStore();

const tabs = [{ id: 'all', name: t('productPage.all') }, ...PRODUCT_TABS.map((tab) => ({ id: tab.id, name: tab.label }))];
const activeTab = ref('all');

interface ProductItem {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  desc?: string;
  icon?: any;
  iconBg?: string;
  iconColor?: string;
  tabId: string;
  tabLabel: string;
}

const allProducts = computed<ProductItem[]>(() => {
  const list: ProductItem[] = [];
  PRODUCT_TABS.forEach((tab: any) => {
    tab.products.forEach((p: any) => {
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
