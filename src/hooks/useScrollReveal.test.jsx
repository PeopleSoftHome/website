import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { useScrollReveal } from './useScrollReveal';

function TestComponent({ threshold = 0.1 }) {
  const { ref } = useScrollReveal(threshold);
  return <div ref={ref} data-testid="reveal" />;
}

describe('useScrollReveal', () => {
  let observers = [];

  beforeEach(() => {
    observers = [];
    class MockIntersectionObserver {
      constructor(cb, opts) {
        this.cb = cb;
        this.opts = opts;
        this.observe = vi.fn();
        this.disconnect = vi.fn();
        observers.push(this);
      }
    }
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('creates IntersectionObserver with default threshold', () => {
    render(<TestComponent />);
    expect(observers.length).toBe(1);
    expect(observers[0].opts.threshold).toBe(0.1);
  });

  it('creates IntersectionObserver with custom threshold', () => {
    render(<TestComponent threshold={0.5} />);
    expect(observers.length).toBe(1);
    expect(observers[0].opts.threshold).toBe(0.5);
  });

  it('adds is-visible class when intersecting', () => {
    const { container } = render(<TestComponent />);
    const el = container.firstChild;

    const obs = observers[0];
    obs.cb([{ isIntersecting: true, target: el }]);
    expect(el.classList.contains('is-visible')).toBe(true);
  });

  it('does not add class when not intersecting', () => {
    const { container } = render(<TestComponent />);
    const el = container.firstChild;

    const obs = observers[0];
    obs.cb([{ isIntersecting: false, target: el }]);
    expect(el.classList.contains('is-visible')).toBe(false);
  });

  it('disconnects on unmount', () => {
    const { unmount } = render(<TestComponent />);
    expect(observers[0].disconnect).not.toHaveBeenCalled();
    unmount();
    expect(observers[0].disconnect).toHaveBeenCalled();
  });
});
