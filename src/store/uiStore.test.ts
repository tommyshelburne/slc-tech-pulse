import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from './uiStore';

beforeEach(() => {
  useUIStore.getState().clearFilters();
});

describe('useUIStore', () => {
  it('has neutral defaults after clearFilters', () => {
    const s = useUIStore.getState();
    expect(s.eventTopicFilter).toEqual([]);
    expect(s.eventDateFilter).toBe('all');
    expect(s.eventFormatFilter).toBe('all');
    expect(s.jobTypeFilter).toBe('all');
    expect(s.jobLevelFilter).toBe('all');
    expect(s.jobLocationFilter).toBe('all');
    expect(s.searchQuery).toBe('');
  });

  it('updates event topic filter', () => {
    useUIStore.getState().setEventTopicFilter(['React', 'AI']);
    expect(useUIStore.getState().eventTopicFilter).toEqual(['React', 'AI']);
  });

  it('updates event date filter', () => {
    useUIStore.getState().setEventDateFilter('week');
    expect(useUIStore.getState().eventDateFilter).toBe('week');
  });

  it('updates job type and level filters', () => {
    useUIStore.getState().setJobTypeFilter('contract');
    useUIStore.getState().setJobLevelFilter('senior');
    expect(useUIStore.getState().jobTypeFilter).toBe('contract');
    expect(useUIStore.getState().jobLevelFilter).toBe('senior');
  });

  it('tracks the search query', () => {
    useUIStore.getState().setSearchQuery('react');
    expect(useUIStore.getState().searchQuery).toBe('react');
  });

  it('clearFilters resets every filter including search query', () => {
    useUIStore.getState().setEventTopicFilter(['React']);
    useUIStore.getState().setJobTypeFilter('internship');
    useUIStore.getState().setSearchQuery('x');

    useUIStore.getState().clearFilters();

    expect(useUIStore.getState().eventTopicFilter).toEqual([]);
    expect(useUIStore.getState().jobTypeFilter).toBe('all');
    expect(useUIStore.getState().searchQuery).toBe('');
  });
});
