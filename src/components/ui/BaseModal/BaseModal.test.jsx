import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BaseModal from './BaseModal';

describe('BaseModal', () => {
  it('renders children when open', () => {
    render(
      <BaseModal isOpen={true} onClose={vi.fn()} ariaLabel="test modal" overlayClassName="overlay">
        <div data-testid="modal-content">Hello</div>
      </BaseModal>
    );
    expect(screen.getByTestId('modal-content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <BaseModal isOpen={false} onClose={vi.fn()} ariaLabel="test modal" overlayClassName="overlay">
        <div data-testid="modal-content">Hello</div>
      </BaseModal>
    );
    expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument();
  });

  it('calls onClose when overlay clicked', () => {
    const onClose = vi.fn();
    render(
      <BaseModal isOpen={true} onClose={onClose} ariaLabel="test modal" overlayClassName="overlay">
        <div data-testid="modal-content">Hello</div>
      </BaseModal>
    );
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when content clicked', () => {
    const onClose = vi.fn();
    render(
      <BaseModal isOpen={true} onClose={onClose} ariaLabel="test modal" overlayClassName="overlay">
        <div data-testid="modal-content">Hello</div>
      </BaseModal>
    );
    fireEvent.click(screen.getByTestId('modal-content'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('has correct ARIA attributes', () => {
    render(
      <BaseModal isOpen={true} onClose={vi.fn()} ariaLabel="demo modal" overlayClassName="overlay">
        <div>Content</div>
      </BaseModal>
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-label', 'demo modal');
  });
});
