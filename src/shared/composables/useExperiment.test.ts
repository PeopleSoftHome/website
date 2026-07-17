import { describe, it, expect, vi, beforeEach } from 'vitest';
import { defineComponent, h } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';
import type { Ref } from 'vue';

const getMock = vi.fn();
const postMock = vi.fn();
vi.mock('@/shared/api/client', () => ({
  apiClient: {
    get: (...args: unknown[]) => getMock(...args),
    post: (...args: unknown[]) => postMock(...args),
  },
}));

import { useExperiment } from './useExperiment';

interface Assignment {
  experimentId: string;
  key: string;
  variant: 'A' | 'B';
  config: Record<string, unknown>;
}

function mountExp(key = 'cta-banner-copy') {
  let exposed: ReturnType<typeof useExperiment> | undefined;
  const comp = defineComponent({
    setup() {
      exposed = useExperiment(key);
      return () => h('div');
    },
  });
  mount(comp);
  return exposed as unknown as {
    assignment: Ref<Assignment | null>;
    variant: Ref<'A' | 'B'>;
    config: Ref<Record<string, unknown>>;
    trackConversion: (p?: Record<string, unknown>) => Promise<void>;
  };
}

describe('useExperiment', () => {
  beforeEach(() => {
    getMock.mockReset();
    postMock.mockReset();
    sessionStorage.clear();
  });

  it('实验运行时返回分桶变体与 config', async () => {
    getMock.mockResolvedValue({
      data: { experimentId: 'e1', key: 'cta-banner-copy', variant: 'B', config: { ctaText: '立即体验' } },
    });
    const exp = mountExp();
    await flushPromises();

    expect(getMock).toHaveBeenCalledWith('/experiments/cta-banner-copy/assign', expect.objectContaining({ params: expect.objectContaining({ sessionId: expect.any(String) }) }));
    expect(exp.variant.value).toBe('B');
    expect(exp.config.value.ctaText).toBe('立即体验');
  });

  it('接口失败时保持 null（默认 A 组语义）', async () => {
    getMock.mockRejectedValue(new Error('network'));
    const exp = mountExp();
    await flushPromises();

    expect(exp.assignment.value).toBeNull();
    expect(exp.variant.value).toBe('A');
    expect(exp.config.value).toEqual({});
  });

  it('trackConversion 上报 conversion 事件', async () => {
    getMock.mockResolvedValue({
      data: { experimentId: 'e1', key: 'k', variant: 'A', config: {} },
    });
    const exp = mountExp();
    await flushPromises();

    await exp.trackConversion({ source: 'test' });
    expect(postMock).toHaveBeenCalledWith('/experiments/e1/events', expect.objectContaining({
      variant: 'A',
      eventType: 'conversion',
      sessionId: expect.any(String),
    }));
  });

  it('未分配到实验时 trackConversion 不发请求', async () => {
    getMock.mockRejectedValue(new Error('network'));
    const exp = mountExp();
    await flushPromises();

    await exp.trackConversion();
    expect(postMock).not.toHaveBeenCalled();
  });
});
