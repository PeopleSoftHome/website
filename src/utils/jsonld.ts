import { computed, toValue } from 'vue';
import type { MaybeRefOrGetter } from 'vue';
import { useHead } from '#imports';

const SCRIPT_ID = 'dynamic-jsonld';

/**
 * @deprecated Use `useJsonLd()` in `<script setup>` instead.
 * Client-only helper kept for any external callers.
 */
export function injectJsonLd(schema: unknown) {
  if (typeof document === 'undefined') return;

  let el = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.id = SCRIPT_ID;
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(schema);
}

/**
 * @deprecated Use `useJsonLd()` in `<script setup>` instead.
 * Client-only helper kept for any external callers.
 */
export function removeJsonLd() {
  if (typeof document === 'undefined') return;
  const el = document.getElementById(SCRIPT_ID);
  if (el) el.remove();
}

/**
 * SSR-safe composable that renders JSON-LD via Nuxt `useHead`.
 * Pass a static schema, a ref, or a getter. The script is removed automatically
 * when the resolved schema becomes null/undefined.
 */
export function useJsonLd(schemaOrGetter: MaybeRefOrGetter<unknown | null | undefined>) {
  const schema = computed(() => toValue(schemaOrGetter));

  useHead(() => {
    const value = schema.value;
    if (!value) return {};

    return {
      script: [
        {
          key: 'jsonld',
          type: 'application/ld+json',
          innerHTML: JSON.stringify(value),
        },
      ],
    };
  });
}
