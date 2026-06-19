import { PRODUCT_TABS } from './tabs.js';

/**
 * 产品 slug → 产品详情 快速查找表
 */
type ProductTab = typeof PRODUCT_TABS[number];
type ProductItem = ProductTab['products'][number];

export const PRODUCT_MAP: Record<string, ProductItem & { tabId: string; tabLabel: string }> = (() => {
  const map: Record<string, ProductItem & { tabId: string; tabLabel: string }> = {};
  PRODUCT_TABS.forEach((tab) => {
    tab.products.forEach((p) => {
      map[p.slug] = { ...p, tabId: tab.id, tabLabel: tab.label };
    });
  });
  return map;
})();
