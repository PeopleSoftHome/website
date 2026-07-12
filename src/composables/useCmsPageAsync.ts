/**
 * useCmsPageAsync — CMS 页面数据异步获取
 * 替代原 onMounted + cmsApi.getPage + sectionRegistry.resolve 模式
 * @param {string} pageKey — CMS 页面标识，如 'home'
 *
 * 注意：sectionRegistry.resolve 返回的 component 是 Vue 组件函数，
 * 无法被 SSR payload 序列化。因此 useAsyncData 中只保留可序列化的元数据，
 * 组件实例由调用方通过 resolveSectionComponent 在渲染时读取。
 */
import { cmsApi } from '@/api/cms';
import { sectionRegistry } from '@/utils/sectionRegistry';

export interface SerializableSection {
  key: string;
  title: string;
  config: Record<string, unknown>;
  sortOrder: number;
  isActive: boolean;
  isUnknown: boolean;
}

export function useCmsPageAsync(pageKey: string) {
  const { data: sections, pending, error, refresh } = useAsyncData(
    `cms-page-${pageKey}`,
    async () => {
      try {
        const page = await cmsApi.getPage(pageKey);
        return sectionRegistry.resolve(page).map(({ component: _component, ...rest }) => rest as SerializableSection);
      } catch (e) {
        const err = e as Error;
        if (import.meta.env.DEV && !/page.*不存在|not found/i.test(err.message || '')) {
          console.warn(`[CmsPage] CMS page config load failed for ${pageKey}:`, err.message);
        }
        return sectionRegistry.resolve(null).map(({ component: _component, ...rest }) => rest as SerializableSection);
      }
    },
    { default: () => [] }
  );

  return { sections, pending, error, refresh };
}

/**
 * 根据序列化后的 section 元数据解析真实 Vue 组件
 */
export function resolveSectionComponent(key: string) {
  return sectionRegistry.get(key)?.component || null;
}
