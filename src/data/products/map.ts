import { getProductList } from './list';
import { getProductDetail } from './detail';

function buildProductMap(locale?: string): Record<string, any> {
  const map: Record<string, any> = {};
  const tabs = getProductList(locale);
  const details = getProductDetail(locale) as Record<string, any>;
  tabs.forEach((tab: any) => {
    tab.products.forEach((p: any) => {
      map[p.slug] = { ...p, tabId: tab.id, tabLabel: tab.label, ...details[p.slug] };
    });
  });
  return map;
}

export function getProductMap(locale?: string) {
  return buildProductMap(locale);
}

/**
 * 产品 slug → 产品详情 快速查找表
 * 由 lightweight 列表数据与 heavy 详情数据合并而成，保持旧消费者兼容。
 */
export const PRODUCT_MAP: Record<string, any> = buildProductMap();
