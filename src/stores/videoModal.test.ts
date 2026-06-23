import { describe, it, expect, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useVideoModalStore } from './videoModal.pinia';

describe('useVideoModalStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('returns video modal state object', () => {
    const vm = useVideoModalStore();
    expect(vm.isOpen).toBeDefined();
    expect(vm.openVideo).toBeDefined();
    expect(vm.closeVideo).toBeDefined();
  });

  it('opens and closes video modal', () => {
    const vm = useVideoModalStore();
    expect(vm.isOpen).toBe(false);
    vm.openVideo();
    expect(vm.isOpen).toBe(true);
    vm.closeVideo();
    expect(vm.isOpen).toBe(false);
  });

  it('is idempotent', () => {
    const vm = useVideoModalStore();
    vm.openVideo();
    vm.openVideo();
    expect(vm.isOpen).toBe(true);
    vm.closeVideo();
    vm.closeVideo();
    expect(vm.isOpen).toBe(false);
  });
});
