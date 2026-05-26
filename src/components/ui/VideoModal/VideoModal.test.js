import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ref } from 'vue';
import { mount } from '@vue/test-utils';
import VideoModal from './VideoModal.vue';

describe('VideoModal', () => {
  beforeEach(() => { document.body.innerHTML = ''; });
  afterEach(() => { document.body.innerHTML = ''; });

  it('renders when open', () => {
    mount(VideoModal, {
      global: {
        provide: {
          i18n: { t: (k) => k },
          videoModal: { isOpen: ref(true), closeVideo: vi.fn() },
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
          videoModal: { isOpen: ref(false), closeVideo: vi.fn() },
        },
      },
      attachTo: document.body,
    });
    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).toBeNull();
  });

  it('contains iframe when open', () => {
    mount(VideoModal, {
      global: {
        provide: {
          i18n: { t: (k) => k },
          videoModal: { isOpen: ref(true), closeVideo: vi.fn() },
        },
      },
      attachTo: document.body,
    });
    expect(document.querySelector('iframe')).not.toBeNull();
  });
});
