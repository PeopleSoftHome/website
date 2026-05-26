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
          v-for="(product, i) in activeTab.products"
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
import { PRODUCT_TABS } from '@/data/products.js';
import { PRODUCT_KEY_MAP, TAB_KEY_MAP } from '@/i18n/keyMap.js';
import { useTabs } from '@/composables/useTabs.js';
import { useApiData } from '@/composables/useApiData.js';
import { cmsApi } from '@/api/cms.js';
import { transformProductTabs } from '@/api/transforms.js';
import SectionHeader from '../../ui/SectionHeader/SectionHeader.vue';
import TabNav from '../../ui/TabNav/TabNav.vue';
import ProductCard from './ProductCard.vue';
import RevealWrapper from '../../ui/RevealWrapper/RevealWrapper.vue';
import s from './ProductMatrixSection.module.css';

const { t } = inject('i18n', { t: (k) => k });
const analytics = inject('analytics', { track: () => {} });
const { activeIndex, selectTab } = useTabs(0);

const originalSelectTab = selectTab;
const trackedSelectTab = (idx) => {
  originalSelectTab(idx);
  analytics.track('product_tab_click', { tab: tabs.value[idx]?.id, index: idx });
};

// API 数据（fallback 为静态数据）
const apiTabs = ref([]);
useApiData(async () => {
  const data = await cmsApi.getProducts();
  return transformProductTabs(data);
}, apiTabs);

const tabs = computed(() => (apiTabs.value.length > 0 ? apiTabs.value : PRODUCT_TABS));
const activeTab = computed(() => tabs.value[activeIndex.value]);

const translatedTabs = computed(() => tabs.value.map(tab => ({
  ...tab,
  label: t(`products.tabs.${TAB_KEY_MAP[tab.id] ?? tab.id}`),
})));

const productKey = (id) => PRODUCT_KEY_MAP[id];
</script>
