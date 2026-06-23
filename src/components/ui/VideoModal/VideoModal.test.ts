import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ref } from 'vue';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { useVideoModalStore } from '@/stores/videoModal.pinia.ts';
import VideoModal from './VideoModal.vue';

describe('VideoModal', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    setActivePinia(createPinia());
  });
  afterEach(() => { document.body.innerHTML = ''; });

  it('renders when open', () => {
    const store = useVideoModalStore();
    store.openVideo();
    mount(VideoModal, {
      global: {
        provide: {
          i18n: { t: (k) => k },
        },
      },
      attachTo: document.body,
    });
    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
  });

  it('does not render when closed', () => {
    mount(VideoModal, {
      global: {
        provide: {
          i18n: { t: (k) => k },
        },
      },
      attachTo: document.body,
    });
    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).toBeNull();
  });

  it('contains iframe when open', () => {
    const store = useVideoModalStore();
    store.openVideo();
    mount(VideoModal, {
      global: {
        provide: {
          i18n: { t: (k) => k },
        },
      },
      attachTo: document.body,
    });
    expect(document.querySelector('iframe')).not.toBeNull();
  });
});
