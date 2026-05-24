import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SectionHeader from './SectionHeader';
import styles from './SectionHeader.module.css';

describe('SectionHeader', () => {
  it('renders title', () => {
    render(<SectionHeader title="Hello World" />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('renders tag when provided', () => {
    render(<SectionHeader tag="Features" title="Hello" />);
    expect(screen.getByText('Features')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(<SectionHeader title="Hello" subtitle="Sub text" />);
    expect(screen.getByText('Sub text')).toBeInTheDocument();
  });

  it('omits tag when not provided', () => {
    const { container } = render(<SectionHeader title="Hello" />);
    expect(container.querySelector('[class*="tag"]')).not.toBeInTheDocument();
  });

  it('omits subtitle when not provided', () => {
    const { container } = render(<SectionHeader title="Hello" />);
    expect(container.querySelector('[class*="subtitle"]')).not.toBeInTheDocument();
  });

  it('applies light variant class', () => {
    const { container } = render(<SectionHeader title="Hello" variant="light" />);
    expect(container.firstChild).toHaveClass(styles.light);
  });

  it('applies dark variant class', () => {
    const { container } = render(<SectionHeader title="Hello" variant="dark" />);
    expect(container.firstChild).toHaveClass(styles.dark);
  });
});
