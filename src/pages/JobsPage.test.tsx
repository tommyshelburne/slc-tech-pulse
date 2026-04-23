import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import JobsPage from './JobsPage';
import { useJobsStore } from '../store/jobsStore';
import { useUIStore } from '../store/uiStore';
import { fetchJobs } from '../services/jobs.service';
import type { Job } from '../types/job';

vi.mock('../services/jobs.service', () => ({ fetchJobs: vi.fn() }));

const mockFetch = fetchJobs as Mock;

const makeJob = (overrides: Partial<Job>): Job => ({
  id: '',
  title: '',
  company: '',
  location: 'Lehi, UT',
  type: 'full-time',
  level: 'mid',
  description: '',
  url: 'https://example.com',
  topics: [],
  postedAt: '2026-04-10T00:00:00Z',
  isHighlighted: false,
  source: 'manual',
  ...overrides,
});

function LocationSpy() {
  const location = useLocation();
  return <div data-testid="location-search">{location.search}</div>;
}

function renderJobs(initialEntry = '/jobs') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <JobsPage />
      <LocationSpy />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  useJobsStore.setState({
    jobs: [
      makeJob({
        id: 'lucid-frontend',
        title: 'Frontend Engineer',
        company: 'Lucid Software',
        type: 'full-time',
        level: 'mid',
        topics: ['React', 'TypeScript'],
        postedAt: '2026-04-15T00:00:00Z',
      }),
      makeJob({
        id: 'qualtrics-intern',
        title: 'Frontend Intern',
        company: 'Qualtrics',
        type: 'internship',
        level: 'junior',
        topics: ['React'],
        postedAt: '2026-04-18T00:00:00Z',
      }),
      makeJob({
        id: 'vivint-remote',
        title: 'Senior Backend',
        company: 'Vivint',
        type: 'full-time',
        level: 'senior',
        location: 'Remote — US',
        topics: ['Node', 'Fintech'],
        postedAt: '2026-04-10T00:00:00Z',
      }),
    ],
    loading: false,
    error: null,
  });
  useUIStore.getState().clearFilters();
  mockFetch.mockResolvedValue([]);
  vi.clearAllMocks();
});

describe('JobsPage', () => {
  it('renders every job and shows the count, sorted by postedAt desc', () => {
    renderJobs();
    expect(screen.getByRole('heading', { level: 1, name: /^jobs$/i })).toBeInTheDocument();
    expect(screen.getByText('3 shown')).toBeInTheDocument();
    const titles = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(titles).toEqual(['Frontend Intern', 'Frontend Engineer', 'Senior Backend']);
  });

  it('filters by type', async () => {
    renderJobs();
    const typeGroup = screen.getByRole('group', { name: 'Type filter' });
    await userEvent.click(within(typeGroup).getByRole('button', { name: 'Internship' }));
    expect(screen.getByRole('heading', { level: 3, name: /frontend intern/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 3, name: /frontend engineer/i })).not.toBeInTheDocument();
  });

  it('filters by level', async () => {
    renderJobs();
    const levelGroup = screen.getByRole('group', { name: 'Level filter' });
    await userEvent.click(within(levelGroup).getByRole('button', { name: 'Senior' }));
    expect(screen.getByRole('heading', { level: 3, name: /senior backend/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 3, name: /frontend engineer/i })).not.toBeInTheDocument();
  });

  it('filters by location category', async () => {
    renderJobs();
    const locationGroup = screen.getByRole('group', { name: 'Location filter' });
    await userEvent.click(within(locationGroup).getByRole('button', { name: 'Remote' }));
    expect(screen.getByRole('heading', { level: 3, name: /senior backend/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 3, name: /frontend engineer/i })).not.toBeInTheDocument();
  });

  it('filters by search against title and company', async () => {
    renderJobs();
    await userEvent.type(screen.getByPlaceholderText(/search title or company/i), 'lucid');
    expect(screen.getByRole('heading', { level: 3, name: /frontend engineer/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 3, name: /frontend intern/i })).not.toBeInTheDocument();
  });

  it('shows filters-empty state with Clear filters when nothing matches', async () => {
    renderJobs();
    await userEvent.type(screen.getByPlaceholderText(/search title or company/i), 'zzzz');
    expect(screen.getByText(/no jobs match those filters/i)).toBeInTheDocument();
    const clears = screen.getAllByRole('button', { name: /clear filters/i });
    await userEvent.click(clears[0]);
    expect(screen.getByRole('heading', { level: 3, name: /frontend engineer/i })).toBeInTheDocument();
  });

  it('hydrates filters from URL params on mount', () => {
    renderJobs('/jobs?type=internship&topic=React');
    expect(screen.getByRole('heading', { level: 3, name: /frontend intern/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 3, name: /frontend engineer/i })).not.toBeInTheDocument();
    const typeGroup = screen.getByRole('group', { name: 'Type filter' });
    expect(within(typeGroup).getByRole('button', { name: 'Internship' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'React' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('reflects filter state in the URL', async () => {
    renderJobs();
    const levelGroup = screen.getByRole('group', { name: 'Level filter' });
    await userEvent.click(within(levelGroup).getByRole('button', { name: 'Senior' }));
    expect(screen.getByTestId('location-search').textContent).toBe('?level=senior');
  });

  it('shows error state when fetch fails', async () => {
    useJobsStore.setState({ jobs: [], loading: false, error: null });
    mockFetch.mockRejectedValueOnce(new Error('network down'));
    renderJobs();
    expect(await screen.findByText(/couldn't load jobs/i)).toBeInTheDocument();
    expect(screen.getByText(/network down/i)).toBeInTheDocument();
  });

  it('renders Submit a job mailto link', () => {
    renderJobs();
    const link = screen.getByRole('link', { name: /submit a job/i });
    expect(link).toHaveAttribute('href', expect.stringContaining('mailto:'));
  });
});
