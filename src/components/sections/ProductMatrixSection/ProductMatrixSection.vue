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
          @select="selectTab"
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
import { computed, inject } from 'vue';
import { PRODUCT_TABS } from '@/data/products.js';
import { PRODUCT_KEY_MAP, TAB_KEY_MAP } from '@/i18n/keyMap.js';
import { useTabs } from '@/composables/useTabs.js';
import SectionHeader from '../../ui/SectionHeader/SectionHeader.vue';
import TabNav from '../../ui/TabNav/TabNav.vue';
import ProductCard from './ProductCard.vue';
import RevealWrapper from '../../ui/RevealWrapper/RevealWrapper.vue';
import s from './ProductMatrixSection.module.css';

const { t } = inject('i18n', { t: (k) => k });
const { activeIndex, selectTab } = useTabs(0);
const activeTab = computed(() => PRODUCT_TABS[activeIndex.value]);

const translatedTabs = computed(() => PRODUCT_TABS.map(tab => ({
  ...tab,
  label: t(`products.tabs.${TAB_KEY_MAP[tab.id] ?? tab.id}`),
})));

const productKey = (id) => PRODUCT_KEY_MAP[id];
</script>
