import { describe, it, expect } from 'vitest';
import { interpolate } from './interpolate';

describe('interpolate', () => {
  it('returns template when no vars', () => {
    expect(interpolate('Hello')).toBe('Hello');
  });

  it('replaces single variable', () => {
    expect(interpolate('Hello {name}', { name: 'World' })).toBe('Hello World');
  });

  it('replaces multiple variables', () => {
    expect(
      interpolate('{greeting} {name}!', { greeting: 'Hi', name: 'Alice' })
    ).toBe('Hi Alice!');
  });

  it('replaces repeated variables', () => {
    expect(
      interpolate('{n} apples and {n} oranges', { n: '3' })
    ).toBe('3 apples and 3 oranges');
  });

  it('handles string values with special characters', () => {
    const result = interpolate('Search: {query}', { query: '<script>alert(1)</script>' });
    // interpolate 不转义 HTML；XSS 防护由调用方（React JSX / DOMPurify）负责
    expect(result).toBe('Search: <script>alert(1)</script>');
  });

  it('handles numeric values', () => {
    expect(interpolate('Count: {n}', { n: 42 })).toBe('Count: 42');
  });
});
