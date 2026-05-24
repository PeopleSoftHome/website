import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchProvider, useSearchContext } from './SearchContext';

function TestComponent() {
  const { isOpen, openSearch, closeSearch } = useSearchContext();
  return (
    <div>
      <span data-testid="status">{isOpen ? 'open' : 'closed'}</span>
      <button onClick={openSearch}>Open</button>
      <button onClick={closeSearch}>Close</button>
    </div>
  );
}

describe('SearchContext', () => {
  it('provides default closed state', () => {
    render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>
    );
    expect(screen.getByTestId('status').textContent).toBe('closed');
  });

  it('opens search', () => {
    render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>
    );
    fireEvent.click(screen.getByText('Open'));
    expect(screen.getByTestId('status').textContent).toBe('open');
  });

  it('closes search', () => {
    render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>
    );
    fireEvent.click(screen.getByText('Open'));
    fireEvent.click(screen.getByText('Close'));
    expect(screen.getByTestId('status').textContent).toBe('closed');
  });

  it('toggles on Cmd+K', () => {
    render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>
    );
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    expect(screen.getByTestId('status').textContent).toBe('open');

    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    expect(screen.getByTestId('status').textContent).toBe('closed');
  });

  it('toggles on Ctrl+K', () => {
    render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>
    );
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(screen.getByTestId('status').textContent).toBe('open');
  });

  it('does not toggle on other keys', () => {
    render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>
    );
    fireEvent.keyDown(window, { key: 'k' });
    expect(screen.getByTestId('status').textContent).toBe('closed');
  });
});
