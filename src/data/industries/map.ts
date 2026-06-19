import { INDUSTRY_TABS } from './tabs.js';

/**
 * 行业 slug → 行业详情 快速查找表
 */
export const INDUSTRY_MAP = (() => {
  const map = {};
  INDUSTRY_TABS.forEach((ind) => {
    map[ind.slug] = ind;
  });
  return map;
})();
