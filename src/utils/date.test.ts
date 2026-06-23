import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { formatDate, formatTime, formatRelativeTime } from './date';

describe('date utils', () => {
  it('formatDate returns empty for null/undefined', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
  });

  it('formatDate formats date string', () => {
    const result = formatDate('2026-06-15T00:00:00Z');
    expect(result).toContain('2026');
    expect(result).toContain('6');
    expect(result).toContain('15');
  });

  it('formatTime returns empty for null/undefined', () => {
    expect(formatTime(null)).toBe('');
    expect(formatTime(undefined)).toBe('');
  });

  it('formatTime formats date string', () => {
    const result = formatTime('2026-06-15T08:30:00Z');
    expect(result).toContain('6');
    expect(result).toContain('15');
  });

  describe('formatRelativeTime', () => {
    const now = new Date('2026-06-15T12:00:00Z');

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(now);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns empty for null/undefined', () => {
      expect(formatRelativeTime(null)).toBe('');
      expect(formatRelativeTime(undefined)).toBe('');
    });

    it('returns 刚刚 within 60s', () => {
      expect(formatRelativeTime(new Date(now.getTime() - 30 * 1000))).toBe('刚刚');
    });

    it('returns minutes ago', () => {
      expect(formatRelativeTime(new Date(now.getTime() - 5 * 60 * 1000))).toBe('5分钟前');
    });

    it('returns hours ago', () => {
      expect(formatRelativeTime(new Date(now.getTime() - 3 * 60 * 60 * 1000))).toBe('3小时前');
    });

    it('returns days ago within a week', () => {
      expect(formatRelativeTime(new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000))).toBe('2天前');
    });

    it('falls back to formatDate after a week', () => {
      const past = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(past)).toBe(formatDate(past));
    });
  });
});
