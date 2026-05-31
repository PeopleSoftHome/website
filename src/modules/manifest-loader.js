import { registerSection } from '@/utils/sectionRegistry.js';
import { registerCmsFetcher, registerFallbackModule } from '@/composables/useCmsData.js';

export function applyManifests(manifests, router) {
  for (const manifest of manifests) {
    if (manifest.sections) {
      for (const s of manifest.sections) {
        registerSection(s.key, {
          title: s.title || s.key,
          icon: s.icon || 'box',
          defaultConfig: s.defaultConfig || {},
          required: s.required || false,
          component: s.component,
        });
      }
    }

    if (manifest.cmsTypes) {
      for (const type of manifest.cmsTypes) {
        if (type.fetcher) registerCmsFetcher(type.key, type.fetcher);
        if (type.fallback) registerFallbackModule(type.key, type.fallback);
      }
    }

    if (router && manifest.routes) {
      for (const route of manifest.routes) {
        router.addRoute(route);
      }
    }
  }
}
