import { INDUSTRY_TABS } from './list';
import { INDUSTRY_DETAILS } from './detail';

/**
 * 行业 slug → 行业详情 快速查找表
 * 由 lightweight 列表数据与 heavy 详情数据合并而成，保持旧消费者兼容。
 */
export const INDUSTRY_MAP: Record<string, any> = (() => {
  const map: Record<string, any> = {};
  INDUSTRY_TABS.forEach((ind) => {
    map[ind.slug] = { ...ind, ...(INDUSTRY_DETAILS as Record<string, any>)[ind.slug] };
  });
  return map;
})();
