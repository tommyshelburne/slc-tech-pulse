import { create } from 'zustand';

export type EventDateFilter = 'all' | 'week' | 'month' | 'next-month';
export type EventFormatFilter = 'all' | 'online' | 'in-person';
export type JobTypeFilter = 'all' | 'full-time' | 'part-time' | 'contract' | 'internship';
export type JobLevelFilter = 'all' | 'junior' | 'mid' | 'senior' | 'staff';
export type JobLocationFilter = 'all' | 'on-site' | 'remote' | 'hybrid';

interface UIState {
  eventTopicFilter: string[];
  eventDateFilter: EventDateFilter;
  eventFormatFilter: EventFormatFilter;
  jobTypeFilter: JobTypeFilter;
  jobLevelFilter: JobLevelFilter;
  jobLocationFilter: JobLocationFilter;
  jobTopicFilter: string[];
  searchQuery: string;
  searchOpen: boolean;
  setEventTopicFilter: (topics: string[]) => void;
  setEventDateFilter: (filter: EventDateFilter) => void;
  setEventFormatFilter: (filter: EventFormatFilter) => void;
  setJobTypeFilter: (filter: JobTypeFilter) => void;
  setJobLevelFilter: (filter: JobLevelFilter) => void;
  setJobLocationFilter: (filter: JobLocationFilter) => void;
  setJobTopicFilter: (topics: string[]) => void;
  setSearchQuery: (q: string) => void;
  setSearchOpen: (open: boolean) => void;
  clearFilters: () => void;
}

const initialFilters = {
  eventTopicFilter: [] as string[],
  eventDateFilter: 'all' as EventDateFilter,
  eventFormatFilter: 'all' as EventFormatFilter,
  jobTypeFilter: 'all' as JobTypeFilter,
  jobLevelFilter: 'all' as JobLevelFilter,
  jobLocationFilter: 'all' as JobLocationFilter,
  jobTopicFilter: [] as string[],
  searchQuery: '',
};

export const useUIStore = create<UIState>((set) => ({
  ...initialFilters,
  searchOpen: false,
  setEventTopicFilter: (eventTopicFilter) => set({ eventTopicFilter }),
  setEventDateFilter: (eventDateFilter) => set({ eventDateFilter }),
  setEventFormatFilter: (eventFormatFilter) => set({ eventFormatFilter }),
  setJobTypeFilter: (jobTypeFilter) => set({ jobTypeFilter }),
  setJobLevelFilter: (jobLevelFilter) => set({ jobLevelFilter }),
  setJobLocationFilter: (jobLocationFilter) => set({ jobLocationFilter }),
  setJobTopicFilter: (jobTopicFilter) => set({ jobTopicFilter }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  clearFilters: () => set({ ...initialFilters }),
}));
