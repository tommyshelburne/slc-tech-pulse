import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { fetchJobs } from '../services/jobs.service';
import { useJobsStore } from './jobsStore';
import type { Job } from '../types/job';

vi.mock('../services/jobs.service', () => ({
  fetchJobs: vi.fn(),
}));

const mockFetch = fetchJobs as Mock;

const baseJob = (overrides: Partial<Job>): Job => ({
  id: '',
  title: '',
  company: '',
  location: '',
  type: 'full-time',
  level: 'mid',
  description: '',
  url: '',
  topics: [],
  postedAt: '',
  isHighlighted: false,
  source: 'manual',
  ...overrides,
});

beforeEach(() => {
  useJobsStore.setState({ jobs: [], loading: false, error: null });
  vi.clearAllMocks();
});

describe('useJobsStore.fetchJobs', () => {
  it('populates jobs on success', async () => {
    const jobs = [baseJob({ id: 'a', postedAt: '2026-04-01' })];
    mockFetch.mockResolvedValueOnce(jobs);

    await useJobsStore.getState().fetchJobs();

    expect(useJobsStore.getState().jobs).toEqual(jobs);
  });

  it('sets error message on failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('nope'));
    await useJobsStore.getState().fetchJobs();
    expect(useJobsStore.getState().error).toBe('nope');
  });
});

describe('useJobsStore selectors', () => {
  beforeEach(() => {
    useJobsStore.setState({
      jobs: [
        baseJob({ id: 'old', postedAt: '2026-01-01', isHighlighted: false }),
        baseJob({ id: 'new', postedAt: '2026-04-01', isHighlighted: true }),
        baseJob({ id: 'mid', postedAt: '2026-02-01', isHighlighted: false }),
      ],
    });
  });

  it('getRecent returns jobs sorted by postedAt descending', () => {
    expect(useJobsStore.getState().getRecent().map((j) => j.id)).toEqual(['new', 'mid', 'old']);
  });

  it('getRecent respects the limit argument', () => {
    expect(useJobsStore.getState().getRecent(2).map((j) => j.id)).toEqual(['new', 'mid']);
  });

  it('getHighlighted returns only highlighted jobs', () => {
    expect(useJobsStore.getState().getHighlighted().map((j) => j.id)).toEqual(['new']);
  });
});
