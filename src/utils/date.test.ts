import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { formatDate, formatTime, formatRelativeTime } from './date';

describe('date utils', () => {
  it('formatDate returns empty for null/undefined', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
  });

  it('formatDate formats date string', () => {
    const result = formatDate('2026-06-15T00:00:00Z', 'zh-CN');
    expect(result).toContain('2026');
    expect(result).toContain('6');
    expect(result).toContain('15');
  });

  it('formatTime returns empty for null/undefined', () => {
    expect(formatTime(null)).toBe('');
    expect(formatTime(undefined)).toBe('');
  });

  it('formatTime formats date string', () => {
    const result = formatTime('2026-06-15T08:30:00Z', 'zh-CN');
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

    it('returns seconds ago within 60s', () => {
      const result = formatRelativeTime(new Date(now.getTime() - 30 * 1000), 'zh-CN');
      expect(result).toMatch(/30/);
      expect(result).toMatch(/秒|second/);
    });

    it('returns minutes ago', () => {
      const result = formatRelativeTime(new Date(now.getTime() - 5 * 60 * 1000), 'zh-CN');
      expect(result).toMatch(/5/);
      expect(result).toMatch(/分|minute/);
    });

    it('returns hours ago', () => {
      const result = formatRelativeTime(new Date(now.getTime() - 3 * 60 * 60 * 1000), 'zh-CN');
      expect(result).toMatch(/3/);
      expect(result).toMatch(/小时|hour/);
    });

    it('returns days ago within a week', () => {
      const past = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
      const result = formatRelativeTime(past, 'zh-CN');
      // numeric: 'auto' 可能输出 "前天"，不一定含数字 2
      expect(result).not.toBe(formatDate(past, 'zh-CN'));
      expect(result).toMatch(/前天|昨天|\d+天|\d+ days|day/);
    });

    it('falls back to formatDate after a week', () => {
      const past = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(past, 'zh-CN')).toBe(formatDate(past, 'zh-CN'));
    });
  });
});
