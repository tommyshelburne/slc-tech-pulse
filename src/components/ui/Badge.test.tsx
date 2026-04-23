import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders the provided label', () => {
    render(<Badge label="React" />);
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('renders accent, success, warning, and danger variants without error', () => {
    for (const variant of ['default', 'accent', 'success', 'warning', 'danger'] as const) {
      const { unmount } = render(<Badge label={variant} variant={variant} />);
      expect(screen.getByText(variant)).toBeInTheDocument();
      unmount();
    }
  });
});
