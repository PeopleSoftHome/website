import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useSessionId, getOrCreateSessionId } from './useSessionId';

describe('useSessionId', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('returns existing id from sessionStorage', () => {
    sessionStorage.setItem('test-key', 'existing-id');
    const { getId } = useSessionId({ key: 'test-key' });
    expect(getId()).toBe('existing-id');
  });

  it('generates and stores new id when missing', () => {
    const { getId } = useSessionId({ key: 'new-key' });
    const id = getId();
    expect(id).toBeTruthy();
    expect(sessionStorage.getItem('new-key')).toBe(id);
  });

  it('uses localStorage when specified', () => {
    const { getId } = useSessionId({ key: 'local-key', storage: 'localStorage' });
    const id = getId();
    expect(localStorage.getItem('local-key')).toBe(id);
    expect(sessionStorage.getItem('local-key')).toBeNull();
  });

  it('resetId replaces existing id', () => {
    sessionStorage.setItem('reset-key', 'old-id');
    const { resetId } = useSessionId({ key: 'reset-key' });
    const newId = resetId();
    expect(newId).not.toBe('old-id');
    expect(sessionStorage.getItem('reset-key')).toBe(newId);
  });

  it('getOrCreateSessionId returns existing id', () => {
    sessionStorage.setItem('global-key', 'global-id');
    expect(getOrCreateSessionId('global-key')).toBe('global-id');
  });

  it('getOrCreateSessionId generates new id when missing', () => {
    const id = getOrCreateSessionId('missing-key');
    expect(id).toBeTruthy();
    expect(sessionStorage.getItem('missing-key')).toBe(id);
  });
});
