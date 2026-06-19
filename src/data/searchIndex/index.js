/**
 * searchIndex.js — 全局搜索索引（Sprint 12 / v2.3.0）
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

import { SEARCH_PRODUCTS } from './products.js';
import { SEARCH_INDUSTRIES } from './industries.js';
import { SEARCH_RESOURCES } from './resources.js';
import { SEARCH_FEATURES } from './features.js';
import { SEARCH_GENERAL } from './general.js';
import { SEARCH_CASES } from './cases.js';
import { SEARCH_PAGES } from './pages.js';
import { SEARCH_MARKETPLACE } from './marketplace.js';
export { SEARCH_PRODUCTS } from './products.js';
export { SEARCH_INDUSTRIES } from './industries.js';
export { SEARCH_RESOURCES } from './resources.js';
export { SEARCH_FEATURES } from './features.js';
export { SEARCH_GENERAL } from './general.js';
export { SEARCH_CASES } from './cases.js';
export { SEARCH_PAGES } from './pages.js';
export { SEARCH_MARKETPLACE } from './marketplace.js';
export { HOT_SEARCHES } from './hotSearches.js';
export { TYPE_LABELS } from './typeLabels.js';

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
];
