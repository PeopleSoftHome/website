import { describe, it, expect } from 'vitest';
import {
  transformProductTabs,
  transformIndustries,
  transformTestimonials,
  transformResources,
  transformWhyUsTabs,
  transformAiCards,
  transformSearchResults,
} from './index';

describe('api transforms', () => {
  it('transformProductTabs handles non-array', () => {
    expect(transformProductTabs(undefined as unknown as unknown[])).toEqual([]);
    expect(transformProductTabs(null as unknown as unknown[])).toEqual([]);
    expect(transformProductTabs('x' as unknown as unknown[])).toEqual([]);
  });

  it('transformProductTabs maps tabs and products', () => {
    const result = transformProductTabs([
      {
        slug: 'hr-saas',
        label: 'HR SaaS',
        products: [{ slug: 'recruit', name: '招聘', description: 'desc', tagline: 'tag' }],
      },
    ] as unknown[]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('hr-saas');
    expect(result[0].label).toBe('HR SaaS');
    expect(result[0].products[0].id).toBe('recruit');
    expect(result[0].products[0].desc).toBe('desc');
  });

  it('transformIndustries handles non-array and maps features', () => {
    expect(transformIndustries(undefined as unknown as unknown[])).toEqual([]);
    const result = transformIndustries([
      { slug: 'mfg', label: '制造业', features: [{ badge: 'b', title: 't', desc: 'd' }] },
    ] as unknown[]);
    expect(result[0].id).toBe('mfg');
    expect(result[0].features[0].badge).toBe('b');
  });

  it('transformTestimonials maps gradients cyclically', () => {
    const result = transformTestimonials(Array.from({ length: 6 }, (_, i) => ({
      id: String(i),
      name: `User ${i}`,
    })) as unknown[]);
    expect(result).toHaveLength(6);
    expect(result[5].avatarGrad).toBe(result[0].avatarGrad);
    expect(result[5].avatarChar).toBe('U');
  });

  it('transformResources uses meta fallback for unknown type', () => {
    const result = transformResources([{
      id: '1',
      type: 'unknown',
      title: 'Title',
      createdAt: '2026-01-01T00:00:00Z',
    }] as unknown[]);
    expect(result[0].typeLabel).toBe('干货文章');
    expect(result[0].date).toBe('2026-01-01');
  });

  it('transformResources prefers publishedAt', () => {
    const result = transformResources([{
      id: '1',
      type: 'report',
      title: 'Title',
      publishedAt: '2026-06-15T00:00:00Z',
      createdAt: '2026-01-01T00:00:00Z',
    }] as unknown[]);
    expect(result[0].date).toBe('2026-06-15');
    expect(result[0].cta).toBe('立即获取');
  });

  it('transformWhyUsTabs maps metrics with fallback', () => {
    const result = transformWhyUsTabs([{
      slug: 'tab1',
      label: 'Tab',
      metrics: [{ value: '99', label: 'Score', desc: 'D' }],
    }] as unknown[]);
    expect(result[0].metrics[0].num).toBe('99');
  });

  it('transformAiCards marks ai-interview as hot', () => {
    const result = transformAiCards([
      { slug: 'ai-interview', name: 'AI 面试' },
      { slug: 'other', name: 'Other' },
    ] as unknown[]);
    expect(result[0].hot).toBe(true);
    expect(result[1].hot).toBe(false);
    expect(result[1].icon).toBe('sparkles');
  });

  it('transformSearchResults uses fallback icon', () => {
    const result = transformSearchResults([{ id: '1', type: 'unknown', title: 'T' }] as unknown[]);
    expect(result[0].icon).toBe('link');
  });
});
