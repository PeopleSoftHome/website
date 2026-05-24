import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Tag from './Tag';
import styles from './Tag.module.css';

describe('Tag', () => {
  it('renders children', () => {
    render(<Tag>Label</Tag>);
    expect(screen.getByText('Label')).toBeInTheDocument();
  });

  it('applies default variant class', () => {
    const { container } = render(<Tag>Label</Tag>);
    expect(container.firstChild).toHaveClass(styles.light);
  });

  it('applies variant class', () => {
    const { container } = render(<Tag variant="primary">Label</Tag>);
    expect(container.firstChild).toHaveClass(styles.primary);
  });

  it('merges custom className', () => {
    const { container } = render(<Tag className="custom-tag">Label</Tag>);
    expect(container.firstChild).toHaveClass('custom-tag');
  });
});
