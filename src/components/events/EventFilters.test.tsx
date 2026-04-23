import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EventFilters } from './EventFilters';
import { useUIStore } from '../../store/uiStore';

beforeEach(() => {
  useUIStore.getState().clearFilters();
});

describe('EventFilters', () => {
  it('toggles topic pills and writes into the store', async () => {
    render(<EventFilters />);

    const reactPill = screen.getByRole('button', { name: 'React' });
    expect(reactPill).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(reactPill);
    expect(reactPill).toHaveAttribute('aria-pressed', 'true');
    expect(useUIStore.getState().eventTopicFilter).toEqual(['React']);

    await userEvent.click(reactPill);
    expect(reactPill).toHaveAttribute('aria-pressed', 'false');
    expect(useUIStore.getState().eventTopicFilter).toEqual([]);
  });

  it('allows multiple topics to be active at once', async () => {
    render(<EventFilters />);

    await userEvent.click(screen.getByRole('button', { name: 'React' }));
    await userEvent.click(screen.getByRole('button', { name: 'AI/ML' }));

    expect(useUIStore.getState().eventTopicFilter.sort()).toEqual(['AI/ML', 'React']);
  });

  it('updates date filter via the select', async () => {
    render(<EventFilters />);

    await userEvent.selectOptions(screen.getByLabelText('Date filter'), 'week');
    expect(useUIStore.getState().eventDateFilter).toBe('week');
  });

  it('updates format filter via the segmented buttons', async () => {
    render(<EventFilters />);

    await userEvent.click(screen.getByRole('button', { name: 'Online' }));
    expect(useUIStore.getState().eventFormatFilter).toBe('online');
  });

  it('drives searchQuery in the store', async () => {
    render(<EventFilters />);

    await userEvent.type(
      screen.getByPlaceholderText(/search event/i),
      'lucid',
    );
    expect(useUIStore.getState().searchQuery).toBe('lucid');
  });

  it('reveals and fires the Clear filters button only when filters are active', async () => {
    const { rerender } = render(<EventFilters />);
    expect(screen.queryByRole('button', { name: /clear filters/i })).not.toBeInTheDocument();

    useUIStore.getState().setEventTopicFilter(['React']);
    rerender(<EventFilters />);

    const clear = screen.getByRole('button', { name: /clear filters/i });
    await userEvent.click(clear);
    expect(useUIStore.getState().eventTopicFilter).toEqual([]);
  });
});
