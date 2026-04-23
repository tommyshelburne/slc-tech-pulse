import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUIStore, type CompanySizeFilter } from '../store/uiStore';

const SIZE_VALUES: CompanySizeFilter[] = ['all', 'startup', 'small', 'mid', 'large', 'enterprise'];

function asSize(value: string | null): CompanySizeFilter {
  return value && (SIZE_VALUES as string[]).includes(value)
    ? (value as CompanySizeFilter)
    : 'all';
}

export function useCompanyFiltersUrlSync(): void {
  const [searchParams, setSearchParams] = useSearchParams();
  const [hydrated, setHydrated] = useState(false);

  const hiring = useUIStore((s) => s.companyHiringFilter);
  const size = useUIStore((s) => s.companySizeFilter);
  const topics = useUIStore((s) => s.companyTopicFilter);
  const query = useUIStore((s) => s.searchQuery);
  const setHiring = useUIStore((s) => s.setCompanyHiringFilter);
  const setSize = useUIStore((s) => s.setCompanySizeFilter);
  const setTopics = useUIStore((s) => s.setCompanyTopicFilter);
  const setQuery = useUIStore((s) => s.setSearchQuery);

  useEffect(() => {
    setHiring(searchParams.get('hiring') === '1');
    setSize(asSize(searchParams.get('size')));
    const urlTopics = searchParams.get('topic');
    setTopics(urlTopics ? urlTopics.split(',').filter(Boolean) : []);
    setQuery(searchParams.get('q') ?? '');
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const next = new URLSearchParams();
    if (hiring) next.set('hiring', '1');
    if (size !== 'all') next.set('size', size);
    if (topics.length > 0) next.set('topic', topics.join(','));
    if (query.trim().length > 0) next.set('q', query);

    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
  }, [hydrated, hiring, size, topics, query, searchParams, setSearchParams]);
}
