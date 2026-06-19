/**
 * useCmsPageAsync — CMS 页面数据异步获取
 * 替代原 onMounted + cmsApi.getPage + sectionRegistry.resolve 模式
 * @param {string} pageKey — CMS 页面标识，如 'home'
 */
import { cmsApi } from '@/api/cms.js';
import { sectionRegistry } from '@/utils/sectionRegistry.js';

export function useCmsPageAsync(pageKey: string) {
  const { data: sections, pending, error, refresh } = useAsyncData(
    `cms-page-${pageKey}`,
    async () => {
      try {
        const page = await cmsApi.getPage(pageKey);
        return sectionRegistry.resolve(page);
      } catch (e) {
        const err = e as Error;
        if (import.meta.env.DEV && !/page.*不存在|not found/i.test(err.message || '')) {
          console.warn(`[CmsPage] CMS page config load failed for ${pageKey}:`, err.message);
        }
        return sectionRegistry.resolve(null);
      }
    },
    { server: false, default: () => [] }
  );

  return { sections, pending, error, refresh };
}
