import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';
import styles from './Button.module.css';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('fires onClick', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('respects disabled state', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Click</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies type attribute', () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('merges custom className', () => {
    const { container } = render(<Button className="my-class">Btn</Button>);
    expect(container.firstChild).toHaveClass('my-class');
  });

  it('applies variant class', () => {
    const { container } = render(<Button variant="secondary">Btn</Button>);
    expect(container.firstChild).toHaveClass(styles.secondary);
  });

  it('applies size class', () => {
    const { container } = render(<Button size="sm">Btn</Button>);
    expect(container.firstChild).toHaveClass(styles.sm);
  });
});
