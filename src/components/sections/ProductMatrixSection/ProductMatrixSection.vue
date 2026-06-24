<template>
  <section :class="s.section" id="products">
    <div class="container">
      <RevealWrapper>
        <SectionHeader
          :tag="t('products.sectionTag')"
          :title="t('products.sectionTitle')"
          :subtitle="t('products.sectionSub')"
        />
      </RevealWrapper>
      <RevealWrapper>
        <TabNav
          :tabs="translatedTabs"
          :active-index="activeIndex"
          variant="segment"
          @select="trackedSelectTab"
        />
      </RevealWrapper>
      <div :class="s.grid" role="tabpanel">
        <ProductCard
          v-for="(product, i) in activeTab?.products || []"
          :key="product.id"
          :icon="product.icon"
          :name="productKey(product.id) ? t(`products.items.${productKey(product.id)}.name`) : product.name"
          :desc="productKey(product.id) ? t(`products.items.${productKey(product.id)}.desc`) : product.desc"
          :link-text="t('products.linkText')"
          :icon-bg="product.iconBg ?? activeTab.iconBg"
          :icon-color="product.iconColor ?? activeTab.iconColor"
          :delay="i % 4"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import { useAnalyticsStore } from '@/stores/analytics.pinia';
import { PRODUCT_KEY_MAP, TAB_KEY_MAP } from '@/i18n/keyMap';
import { useTabs } from '@/composables/useTabs';
import { useCmsDataByKey } from '@/composables/useCmsData';
import { transformProductTabs } from '@/api/transforms';
import SectionHeader from '../../ui/SectionHeader/SectionHeader.vue';
import TabNav from '../../ui/TabNav/TabNav.vue';
import ProductCard from './ProductCard.vue';
import RevealWrapper from '../../ui/RevealWrapper/RevealWrapper.vue';
import s from './ProductMatrixSection.module.css';

interface ProductItem {
  id: string;
  icon: string;
  name: string;
  desc: string;
  iconBg?: string;
  iconColor?: string;
}

interface ProductTab {
  id: string;
  label: string;
  products: ProductItem[];
  iconBg?: string;
  iconColor?: string;
}

const { t } = useI18n();
const analyticsStore = useAnalyticsStore();
const { activeIndex, selectTab } = useTabs(0);

const originalSelectTab = selectTab;
const trackedSelectTab = (idx: number) => {
  originalSelectTab(idx);
  analyticsStore.track('product_tab_click', { tab: tabs.value?.[idx]?.id, index: idx });
};

const { displayItems: rawTabs, isLoading: loading } = useCmsDataByKey('products', {
  transform: transformProductTabs,
  fallbackKey: 'products',
});
const tabs = computed(() => rawTabs.value as unknown as ProductTab[]);

const activeTab = computed(() => tabs.value[activeIndex.value] ?? { products: [], iconBg: '', iconColor: '' });

const translatedTabs = computed(() => (tabs.value || []).map((tab) => {
  const keyMap = TAB_KEY_MAP as Record<string, string>;
  const key = keyMap[tab.id] ?? tab.id;
  const translated = t(`products.tabs.${key}`);
  return {
    ...tab,
    label: translated === `products.tabs.${key}` ? tab.label : translated,
  };
}));

const productKey = (id: string) => (PRODUCT_KEY_MAP as Record<string, string>)[id];
</script>
