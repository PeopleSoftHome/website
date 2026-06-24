import { describe, it, expect } from 'vitest';
import { useVideoModal } from './useVideoModal';

describe('useVideoModal', () => {
  it('starts closed', () => {
    const { isOpen } = useVideoModal();
    expect(isOpen.value).toBe(false);
  });

  it('opens video', () => {
    const { isOpen, openVideo } = useVideoModal();
    openVideo();
    expect(isOpen.value).toBe(true);
  });

  it('closes video', () => {
    const { isOpen, openVideo, closeVideo } = useVideoModal();
    openVideo();
    closeVideo();
    expect(isOpen.value).toBe(false);
  });
});
