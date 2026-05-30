/**
 * Nuxt Plugin — Manifest 系统初始化
 * 替代原 main.js 中的 manifest-loader 逻辑
 */
export default defineNuxtPlugin(async (nuxtApp) => {
  // Build-time scan of all module manifests
  const manifestModules = import.meta.glob('./modules/**/manifest.js', { eager: true });
  const manifests = Object.values(manifestModules)
    .map((mod: any) => mod.default || mod)
    .filter(Boolean);

  // Apply all manifests before app mount
  // 注意：Nuxt 中 router 已自动创建，manifests 注册 Section/CMS 类型即可
  for (const manifest of manifests) {
    if (manifest.sections) {
      // registerSection logic
    }
    if (manifest.cmsTypes) {
      // registerCmsFetcher + registerFallbackModule
    }
  }
});
