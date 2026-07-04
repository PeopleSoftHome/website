import { getIndustryList } from './list';
import { getIndustryDetails } from './detail';

function buildIndustryMap(locale?: string): Record<string, any> {
  const map: Record<string, any> = {};
  const tabs = getIndustryList(locale);
  const details = getIndustryDetails(locale) as Record<string, any>;
  tabs.forEach((ind) => {
    map[ind.slug] = { ...ind, ...details[ind.slug] };
  });
  return map;
}

export function getIndustryMap(locale?: string) {
  return buildIndustryMap(locale);
}

/**
 * 行业 slug → 行业详情 快速查找表
 * 由 lightweight 列表数据与 heavy 详情数据合并而成，保持旧消费者兼容。
 */
export const INDUSTRY_MAP: Record<string, any> = buildIndustryMap();
