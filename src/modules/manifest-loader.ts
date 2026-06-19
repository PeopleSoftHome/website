import { registerSection } from '@/utils/sectionRegistry.js';
import { registerCmsFetcher, registerFallbackModule } from '@/composables/useCmsData.js';
import type { Router, RouteRecordRaw } from 'vue-router';
import type { Component } from 'vue';

interface SectionManifest {
  key: string;
  title?: string;
  icon?: string;
  defaultConfig?: Record<string, unknown>;
  required?: boolean;
  component?: Component;
}

interface CmsTypeManifest {
  key: string;
  fetcher?: () => Promise<unknown>;
  fallback?: () => Promise<unknown>;
}

interface Manifest {
  sections?: SectionManifest[];
  cmsTypes?: CmsTypeManifest[];
  routes?: RouteRecordRaw[];
}

export function applyManifests(manifests: Manifest[], router?: Router) {
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
        if (type.fetcher) registerCmsFetcher(type.key, type.fetcher as () => Promise<unknown[]>);
        if (type.fallback) registerFallbackModule(type.key, type.fallback as () => Promise<unknown[]>);
      }
    }

    if (router && manifest.routes) {
      for (const route of manifest.routes) {
        router.addRoute(route);
      }
    }
  }
}
