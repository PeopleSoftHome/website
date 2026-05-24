import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TabNav from './TabNav';
import styles from './TabNav.module.css';

describe('TabNav', () => {
  const tabs = [
    { id: 'a', label: 'Tab A' },
    { id: 'b', label: 'Tab B' },
    { id: 'c', label: 'Tab C' },
  ];

  it('renders correct number of tabs', () => {
    render(<TabNav tabs={tabs} activeIndex={0} onSelect={() => {}} />);
    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });

  it('displays tab labels', () => {
    render(<TabNav tabs={tabs} activeIndex={0} onSelect={() => {}} />);
    tabs.forEach(t => {
      expect(screen.getByText(t.label)).toBeInTheDocument();
    });
  });

  it('marks active tab with aria-selected', () => {
    render(<TabNav tabs={tabs} activeIndex={1} onSelect={() => {}} />);
    const tabEls = screen.getAllByRole('tab');
    expect(tabEls[0]).toHaveAttribute('aria-selected', 'false');
    expect(tabEls[1]).toHaveAttribute('aria-selected', 'true');
    expect(tabEls[2]).toHaveAttribute('aria-selected', 'false');
  });

  it('fires onSelect with index on click', () => {
    const handleSelect = vi.fn();
    render(<TabNav tabs={tabs} activeIndex={0} onSelect={handleSelect} />);
    fireEvent.click(screen.getByText('Tab B'));
    expect(handleSelect).toHaveBeenCalledWith(1);
  });

  it('fires onSelect even when clicking already active tab', () => {
    const handleSelect = vi.fn();
    render(<TabNav tabs={tabs} activeIndex={0} onSelect={handleSelect} />);
    fireEvent.click(screen.getByText('Tab A'));
    expect(handleSelect).toHaveBeenCalledWith(0);
  });

  it('applies variant class', () => {
    const { container } = render(
      <TabNav tabs={tabs} activeIndex={0} onSelect={() => {}} variant="dark" />
    );
    expect(container.firstChild).toHaveClass(styles.dark);
  });
});
