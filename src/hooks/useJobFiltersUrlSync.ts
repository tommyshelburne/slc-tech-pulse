import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  useUIStore,
  type JobLevelFilter,
  type JobLocationFilter,
  type JobTypeFilter,
} from '../store/uiStore';

const TYPE_VALUES: JobTypeFilter[] = ['all', 'full-time', 'part-time', 'contract', 'internship'];
const LEVEL_VALUES: JobLevelFilter[] = ['all', 'junior', 'mid', 'senior', 'staff'];
const LOCATION_VALUES: JobLocationFilter[] = ['all', 'on-site', 'remote', 'hybrid'];

function asType(value: string | null): JobTypeFilter {
  return value && (TYPE_VALUES as string[]).includes(value) ? (value as JobTypeFilter) : 'all';
}

function asLevel(value: string | null): JobLevelFilter {
  return value && (LEVEL_VALUES as string[]).includes(value) ? (value as JobLevelFilter) : 'all';
}

function asLocation(value: string | null): JobLocationFilter {
  return value && (LOCATION_VALUES as string[]).includes(value)
    ? (value as JobLocationFilter)
    : 'all';
}

export function useJobFiltersUrlSync(): void {
  const [searchParams, setSearchParams] = useSearchParams();
  const [hydrated, setHydrated] = useState(false);

  const type = useUIStore((s) => s.jobTypeFilter);
  const level = useUIStore((s) => s.jobLevelFilter);
  const location = useUIStore((s) => s.jobLocationFilter);
  const topics = useUIStore((s) => s.jobTopicFilter);
  const query = useUIStore((s) => s.searchQuery);
  const setType = useUIStore((s) => s.setJobTypeFilter);
  const setLevel = useUIStore((s) => s.setJobLevelFilter);
  const setLocation = useUIStore((s) => s.setJobLocationFilter);
  const setTopics = useUIStore((s) => s.setJobTopicFilter);
  const setQuery = useUIStore((s) => s.setSearchQuery);

  useEffect(() => {
    setType(asType(searchParams.get('type')));
    setLevel(asLevel(searchParams.get('level')));
    setLocation(asLocation(searchParams.get('location')));
    const urlTopics = searchParams.get('topic');
    setTopics(urlTopics ? urlTopics.split(',').filter(Boolean) : []);
    setQuery(searchParams.get('q') ?? '');
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const next = new URLSearchParams();
    if (type !== 'all') next.set('type', type);
    if (level !== 'all') next.set('level', level);
    if (location !== 'all') next.set('location', location);
    if (topics.length > 0) next.set('topic', topics.join(','));
    if (query.trim().length > 0) next.set('q', query);

    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
  }, [hydrated, type, level, location, topics, query, searchParams, setSearchParams]);
}
