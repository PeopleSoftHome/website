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

<script setup>
import { computed, inject, ref } from 'vue';

import { PRODUCT_KEY_MAP, TAB_KEY_MAP } from '@/i18n/keyMap.js';
import { useTabs } from '@/composables/useTabs.js';
import { useCmsDataByKey } from '@/composables/useCmsData.js';
import { transformProductTabs } from '@/api/transforms.js';
import SectionHeader from '../../ui/SectionHeader/SectionHeader.vue';
import TabNav from '../../ui/TabNav/TabNav.vue';
import ProductCard from './ProductCard.vue';
import RevealWrapper from '../../ui/RevealWrapper/RevealWrapper.vue';
import s from './ProductMatrixSection.module.css';

const { t } = useI18n();
const analytics = inject('analytics', { track: () => {} });
const { activeIndex, selectTab } = useTabs(0);

const originalSelectTab = selectTab;
const trackedSelectTab = (idx) => {
  originalSelectTab(idx);
  analytics.track('product_tab_click', { tab: tabs.value?.[idx]?.id, index: idx });
};

const { displayItems: tabs, isLoading: loading } = useCmsDataByKey('products', {
  transform: transformProductTabs,
  fallbackKey: 'products',
});


const activeTab = computed(() => tabs.value[activeIndex.value] ?? { products: [], iconBg: '', iconColor: '' });

const translatedTabs = computed(() => (tabs.value || []).map((tab) => {
  const key = TAB_KEY_MAP[tab.id] ?? tab.id;
  const translated = t(`products.tabs.${key}`);
  return {
    ...tab,
    label: translated === `products.tabs.${key}` ? tab.label : translated,
  };
}));

const productKey = (id) => PRODUCT_KEY_MAP[id];
</script>
