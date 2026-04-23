import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUIStore, type EventDateFilter, type EventFormatFilter } from '../store/uiStore';

const DATE_VALUES: EventDateFilter[] = ['all', 'week', 'month', 'next-month'];
const FORMAT_VALUES: EventFormatFilter[] = ['all', 'online', 'in-person'];

function asDate(value: string | null): EventDateFilter {
  return value && (DATE_VALUES as string[]).includes(value)
    ? (value as EventDateFilter)
    : 'all';
}

function asFormat(value: string | null): EventFormatFilter {
  return value && (FORMAT_VALUES as string[]).includes(value)
    ? (value as EventFormatFilter)
    : 'all';
}

export function useEventFiltersUrlSync(): void {
  const [searchParams, setSearchParams] = useSearchParams();
  const [hydrated, setHydrated] = useState(false);

  const topics = useUIStore((s) => s.eventTopicFilter);
  const date = useUIStore((s) => s.eventDateFilter);
  const format = useUIStore((s) => s.eventFormatFilter);
  const query = useUIStore((s) => s.searchQuery);
  const setTopics = useUIStore((s) => s.setEventTopicFilter);
  const setDate = useUIStore((s) => s.setEventDateFilter);
  const setFormat = useUIStore((s) => s.setEventFormatFilter);
  const setQuery = useUIStore((s) => s.setSearchQuery);

  useEffect(() => {
    const urlTopics = searchParams.get('topic');
    setTopics(urlTopics ? urlTopics.split(',').filter(Boolean) : []);
    setDate(asDate(searchParams.get('date')));
    setFormat(asFormat(searchParams.get('format')));
    setQuery(searchParams.get('q') ?? '');
    setHydrated(true);
    // Only hydrate from URL on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const next = new URLSearchParams();
    if (topics.length > 0) next.set('topic', topics.join(','));
    if (date !== 'all') next.set('date', date);
    if (format !== 'all') next.set('format', format);
    if (query.trim().length > 0) next.set('q', query);

    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
  }, [hydrated, topics, date, format, query, searchParams, setSearchParams]);
}
