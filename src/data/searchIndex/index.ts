/**
 * searchIndex.ts — 全局搜索索引（Sprint 12 / v2.3.0）
 *
 * 结构：每条记录包含
 *   id:      唯一 ID
 *   type:    'product' | 'industry' | 'resource' | 'feature' | 'general'
 *   title:   搜索结果标题（中文，en 版本用同一索引 + i18n 处理）
 *   tags:    关键词数组（中英文混合，用于模糊命中）
 *   desc:    搜索结果描述
 *   section: 点击后滚动定位的 Section ID
 *   icon:    展示图标（Emoji）
 *   weight:  权重系数 0.5~1.0（影响排序）
 */

import { SEARCH_PRODUCTS } from './products';
import { SEARCH_INDUSTRIES } from './industries';
import { SEARCH_RESOURCES } from './resources';
import { SEARCH_FEATURES } from './features';
import { SEARCH_GENERAL } from './general';
import { SEARCH_CASES } from './cases';
import { SEARCH_PAGES } from './pages';
import { SEARCH_MARKETPLACE } from './marketplace';
import { SEARCH_NEWS } from './news';
import { SEARCH_JOBS } from './jobs';
import { SEARCH_TEAM } from './team';
import { SEARCH_PARTNERS } from './partners';
export { SEARCH_PRODUCTS } from './products';
export { SEARCH_INDUSTRIES } from './industries';
export { SEARCH_RESOURCES } from './resources';
export { SEARCH_FEATURES } from './features';
export { SEARCH_GENERAL } from './general';
export { SEARCH_CASES } from './cases';
export { SEARCH_PAGES } from './pages';
export { SEARCH_MARKETPLACE } from './marketplace';
export { SEARCH_NEWS } from './news';
export { SEARCH_JOBS } from './jobs';
export { SEARCH_TEAM } from './team';
export { SEARCH_PARTNERS } from './partners';
export { HOT_SEARCHES } from './hotSearches';
export { TYPE_LABELS } from './typeLabels';

/* ══════════════ 合并完整索引 ══════════════ */
export const SEARCH_INDEX = [
  ...SEARCH_PRODUCTS,
  ...SEARCH_INDUSTRIES,
  ...SEARCH_RESOURCES,
  ...SEARCH_FEATURES,
  ...SEARCH_GENERAL,
  ...SEARCH_CASES,
  ...SEARCH_PAGES,
  ...SEARCH_MARKETPLACE,
  ...SEARCH_NEWS,
  ...SEARCH_JOBS,
  ...SEARCH_TEAM,
  ...SEARCH_PARTNERS,
];
