/**
 * Global TypeScript augmentations for TalentPro portal.
 * These declarations extend third-party types used across the project.
 */

import type { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

// Axios: custom `silent` flag used by response interceptor to suppress error logs
declare module 'axios' {
  interface AxiosRequestConfig {
    silent?: boolean;
  }
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
    silent?: boolean;
  }
}

// Vite / Nuxt runtime environment on import.meta.env
interface ImportMetaEnv {
  DEV: boolean;
  PROD: boolean;
  SSR: boolean;
  MODE: string;
  BASE_URL: string;
}

declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }

  // Custom events dispatched by the API client
  interface WindowEventMap {
    'auth:refresh': CustomEvent;
    'auth:logout': CustomEvent;
  }

  // Analytics / tracking globals used by composables
  interface Window {
    tp_analytics?: {
      queue?: unknown[];
      _queue?: unknown[];
      push?: (...args: unknown[]) => void;
      flush?: () => void;
      [key: string]: unknown;
    };
    grecaptcha?: {
      execute: (siteKey: string, options?: { action?: string }) => Promise<string>;
      ready?: (callback: () => void) => void;
    };
    dataLayer?: unknown[];
  }
}

export {};
