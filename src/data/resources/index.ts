import { createLocalizedData } from '../../utils/localizedData';
import { RESOURCES_ZH, RESOURCES_EN } from './items';
import { RESOURCE_TYPES_ZH, RESOURCE_TYPES_EN } from './types';
import type { Resource, ResourceType } from './types';

const resourcesData = createLocalizedData<Resource>({ zh: RESOURCES_ZH, en: RESOURCES_EN });
const resourceTypesData = createLocalizedData<ResourceType>({ zh: RESOURCE_TYPES_ZH, en: RESOURCE_TYPES_EN });

export const getResources = resourcesData.getItems;
export const getResourceTypes = resourceTypesData.getItems;

/** 兼容旧直接引用：默认中文 */
export { RESOURCES_ZH as RESOURCES } from './items';
export { RESOURCE_TYPES_ZH as RESOURCE_TYPES, RESOURCE_TYPE_STYLES } from './types';
