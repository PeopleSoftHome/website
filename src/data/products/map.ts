import { PRODUCT_TABS } from './list';
import { PRODUCT_DETAILS } from './detail';

/**
 * 产品 slug → 产品详情 快速查找表
 * 由 lightweight 列表数据与 heavy 详情数据合并而成，保持旧消费者兼容。
 */
export const PRODUCT_MAP: Record<string, any> = (() => {
  const map: Record<string, any> = {};
  PRODUCT_TABS.forEach((tab) => {
    tab.products.forEach((p) => {
      map[p.slug] = { ...p, tabId: tab.id, tabLabel: tab.label, ...(PRODUCT_DETAILS as Record<string, any>)[p.slug] };
    });
  });
  return map;
})();
