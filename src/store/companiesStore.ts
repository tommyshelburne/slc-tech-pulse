import { create } from 'zustand';
import { fetchCompanies as fetchCompaniesService } from '../services/companies.service';
import type { Company } from '../types/company';

interface CompaniesState {
  companies: Company[];
  loading: boolean;
  error: string | null;
  fetchCompanies: () => Promise<void>;
  getHiring: () => Company[];
  getFeatured: () => Company[];
  getById: (id: string) => Company | undefined;
}

export const useCompaniesStore = create<CompaniesState>((set, get) => ({
  companies: [],
  loading: false,
  error: null,
  fetchCompanies: async () => {
    set({ loading: true, error: null });
    try {
      const companies = await fetchCompaniesService();
      set({ companies, loading: false });
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load companies',
      });
    }
  },
  getHiring: () => get().companies.filter((c) => c.isHiring),
  getFeatured: () => get().companies.filter((c) => c.isFeatured),
  getById: (id) => get().companies.find((c) => c.id === id),
}));
