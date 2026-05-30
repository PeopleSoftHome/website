/**
 * useCmsPageAsync — CMS 页面数据异步获取
 * 替代原 onMounted + cmsApi.getPage + sectionRegistry.resolve 模式
 * @param {string} pageKey — CMS 页面标识，如 'home'
 */
import { cmsApi } from '@/api/cms.js';
import { sectionRegistry } from '@/plugins/sectionRegistry.js';

export function useCmsPageAsync(pageKey) {
  const { data: sections, pending, error, refresh } = useAsyncData(
    `cms-page-${pageKey}`,
    async () => {
      try {
        const page = await cmsApi.getPage(pageKey);
        return sectionRegistry.resolve(page);
      } catch (e) {
        if (import.meta.env.DEV) {
          console.warn(`[CmsPage] CMS page config load failed for ${pageKey}:`, e.message);
        }
        return sectionRegistry.resolve(null);
      }
    },
    { server: false, default: () => [] }
  );

  return { sections, pending, error, refresh };
}
