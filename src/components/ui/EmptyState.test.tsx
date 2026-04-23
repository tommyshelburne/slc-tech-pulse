import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders the title', () => {
    render(<EmptyState title="No results" />);
    expect(screen.getByRole('heading', { name: 'No results' })).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(<EmptyState title="Empty" subtitle="Try a different filter" />);
    expect(screen.getByText('Try a different filter')).toBeInTheDocument();
  });

  it('does not render subtitle when omitted', () => {
    render(<EmptyState title="Nothing" />);
    expect(screen.queryByText('Try a different filter')).not.toBeInTheDocument();
  });
});
