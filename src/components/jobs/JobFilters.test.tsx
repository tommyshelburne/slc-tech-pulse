import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JobFilters } from './JobFilters';
import { useUIStore } from '../../store/uiStore';

beforeEach(() => {
  useUIStore.getState().clearFilters();
});

describe('JobFilters', () => {
  it('toggles topic pills and updates the store', async () => {
    render(<JobFilters />);
    const reactPill = screen.getByRole('button', { name: 'React' });
    await userEvent.click(reactPill);
    expect(reactPill).toHaveAttribute('aria-pressed', 'true');
    expect(useUIStore.getState().jobTopicFilter).toEqual(['React']);
  });

  it('updates type via segmented toggle', async () => {
    render(<JobFilters />);
    const typeGroup = screen.getByRole('group', { name: 'Type filter' });
    await userEvent.click(within(typeGroup).getByRole('button', { name: 'Internship' }));
    expect(useUIStore.getState().jobTypeFilter).toBe('internship');
  });

  it('updates level via segmented toggle', async () => {
    render(<JobFilters />);
    const levelGroup = screen.getByRole('group', { name: 'Level filter' });
    await userEvent.click(within(levelGroup).getByRole('button', { name: 'Senior' }));
    expect(useUIStore.getState().jobLevelFilter).toBe('senior');
  });

  it('updates location via segmented toggle', async () => {
    render(<JobFilters />);
    const locationGroup = screen.getByRole('group', { name: 'Location filter' });
    await userEvent.click(within(locationGroup).getByRole('button', { name: 'Remote' }));
    expect(useUIStore.getState().jobLocationFilter).toBe('remote');
  });

  it('drives searchQuery in the store', async () => {
    render(<JobFilters />);
    await userEvent.type(screen.getByPlaceholderText(/search title or company/i), 'lucid');
    expect(useUIStore.getState().searchQuery).toBe('lucid');
  });

  it('reveals Clear filters only when a filter is active and resets on click', async () => {
    const { rerender } = render(<JobFilters />);
    expect(screen.queryByRole('button', { name: /clear filters/i })).not.toBeInTheDocument();

    useUIStore.getState().setJobTypeFilter('internship');
    rerender(<JobFilters />);

    const clear = screen.getByRole('button', { name: /clear filters/i });
    await userEvent.click(clear);
    expect(useUIStore.getState().jobTypeFilter).toBe('all');
  });
});
