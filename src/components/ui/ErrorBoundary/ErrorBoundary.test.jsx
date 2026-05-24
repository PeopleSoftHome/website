import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

const ThrowError = ({ shouldThrow }) => {
  if (shouldThrow) throw new Error('Test error');
  return <div>Normal content</div>;
};

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Normal content')).toBeInTheDocument();
  });

  it('renders fallback when child throws', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary fallback={<div>Error fallback</div>}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Error fallback')).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it('renders null when no fallback and child throws', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { container } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(container.firstChild).toBeNull();
    consoleSpy.mockRestore();
  });
});
