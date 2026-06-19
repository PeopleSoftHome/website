import { PRODUCT_TABS } from './tabs.js';

/**
 * 产品 slug → 产品详情 快速查找表
 */
export const PRODUCT_MAP = (() => {
  const map = {};
  PRODUCT_TABS.forEach((tab) => {
    tab.products.forEach((p) => {
      map[p.slug] = { ...p, tabId: tab.id, tabLabel: tab.label };
    });
  });
  return map;
})();
