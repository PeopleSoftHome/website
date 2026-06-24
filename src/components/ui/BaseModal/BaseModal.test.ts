import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import BaseModal from './BaseModal.vue';

describe('BaseModal', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders when isOpen is true', () => {
    mount(BaseModal, {
      props: { isOpen: true, ariaLabel: 'Test' },
      slots: { default: 'Content' },
      attachTo: document.body,
    });
    expect(document.body.textContent).toContain('Content');
  });

  it('does not render when isOpen is false', () => {
    mount(BaseModal, {
      props: { isOpen: false, ariaLabel: 'Test' },
      slots: { default: 'Content' },
      attachTo: document.body,
    });
    expect(document.body.textContent).not.toContain('Content');
  });

  it('has dialog role and aria-modal', () => {
    mount(BaseModal, {
      props: { isOpen: true, ariaLabel: 'Demo' },
      attachTo: document.body,
    });
    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
  });

  it('emits close on overlay click', async () => {
    const wrapper = mount(BaseModal, {
      props: { isOpen: true, ariaLabel: 'Test' },
      attachTo: document.body,
    });
    // Trigger click directly on the overlay element (currentTarget === target)
    const overlay = document.querySelector('[role="dialog"]');
    overlay.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('close')).toHaveLength(1);
  });
});
