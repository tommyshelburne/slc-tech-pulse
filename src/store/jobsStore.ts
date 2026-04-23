import { create } from 'zustand';
import { fetchJobs as fetchJobsService } from '../services/jobs.service';
import type { Job } from '../types/job';

interface JobsState {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  fetchJobs: () => Promise<void>;
  getRecent: (limit?: number) => Job[];
  getHighlighted: () => Job[];
  getById: (id: string) => Job | undefined;
}

export const useJobsStore = create<JobsState>((set, get) => ({
  jobs: [],
  loading: false,
  error: null,
  fetchJobs: async () => {
    set({ loading: true, error: null });
    try {
      const jobs = await fetchJobsService();
      set({ jobs, loading: false });
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : 'Failed to load jobs' });
    }
  },
  getRecent: (limit) => {
    const sorted = [...get().jobs].sort(
      (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime(),
    );
    return typeof limit === 'number' ? sorted.slice(0, limit) : sorted;
  },
  getHighlighted: () => get().jobs.filter((j) => j.isHighlighted),
  getById: (id) => get().jobs.find((j) => j.id === id),
}));
