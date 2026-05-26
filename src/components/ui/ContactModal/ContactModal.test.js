import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ContactModal from './ContactModal.vue';

describe('ContactModal', () => {
  beforeEach(() => { document.body.innerHTML = ''; });
  afterEach(() => { document.body.innerHTML = ''; });

  it('renders when open', () => {
    mount(ContactModal, {
      props: { isOpen: true },
      global: { provide: { i18n: { t: (k) => k } } },
      attachTo: document.body,
    });
    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
  });

  it('does not render when closed', () => {
    mount(ContactModal, {
      props: { isOpen: false },
      global: { provide: { i18n: { t: (k) => k } } },
      attachTo: document.body,
    });
    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).toBeNull();
  });

  it('emits close on close button click', async () => {
    const wrapper = mount(ContactModal, {
      props: { isOpen: true },
      global: { provide: { i18n: { t: (k) => k } } },
      attachTo: document.body,
    });
    const closeBtn = wrapper.findAll('button').find(b => b.text() === '✕');
    if (closeBtn) {
      await closeBtn.trigger('click');
      expect(wrapper.emitted('close')).toHaveLength(1);
    }
  });
});
