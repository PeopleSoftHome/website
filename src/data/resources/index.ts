import { RESOURCES_ZH, RESOURCES_EN } from './items';
import { RESOURCE_TYPES_ZH, RESOURCE_TYPES_EN, RESOURCE_TYPE_STYLES } from './types';
import type { Resource, ResourceType } from './types';

export { RESOURCES_ZH, RESOURCES_EN } from './items';
export { RESOURCE_TYPES_ZH, RESOURCE_TYPES_EN, RESOURCE_TYPE_STYLES } from './types';

export function getResources(locale?: string): Resource[] {
  if (locale === 'zh' || locale === 'zh-TW') return RESOURCES_ZH;
  return RESOURCES_EN;
}

export function getResourceTypes(locale?: string): ResourceType[] {
  if (locale === 'zh' || locale === 'zh-TW') return RESOURCE_TYPES_ZH;
  return RESOURCE_TYPES_EN;
}

/** 兼容旧直接引用：默认中文 */
export { RESOURCES_ZH as RESOURCES } from './items';
export { RESOURCE_TYPES_ZH as RESOURCE_TYPES } from './types';
