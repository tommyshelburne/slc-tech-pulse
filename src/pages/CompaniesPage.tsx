import { useEffect, useMemo, useState } from 'react';
import { useCompaniesStore } from '../store/companiesStore';
import { CompanyCard } from '../components/companies/CompanyCard';
import { CompanyFilters } from '../components/companies/CompanyFilters';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { filterCompanies, type CompanySizeFilter } from '../utils/filters';

export default function CompaniesPage() {
  const companies = useCompaniesStore((s) => s.companies);
  const loading = useCompaniesStore((s) => s.loading);
  const error = useCompaniesStore((s) => s.error);

  const [hiring, setHiring] = useState(false);
  const [size, setSize] = useState<CompanySizeFilter>('all');
  const [topics, setTopics] = useState<string[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const state = useCompaniesStore.getState();
    if (!state.loading && state.companies.length === 0) {
      void state.fetchCompanies();
    }
  }, []);

  const filtered = useMemo(
    () =>
      filterCompanies(companies, { hiring, size, topics, query }).sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    [companies, hiring, size, topics, query],
  );

  const hasActiveFilters = hiring || size !== 'all' || topics.length > 0 || query.length > 0;

  const clear = () => {
    setHiring(false);
    setSize('all');
    setTopics([]);
    setQuery('');
  };

  return (
    <div>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Companies</h1>
          <Badge label={`${filtered.length} shown`} />
        </div>
      </header>

      <CompanyFilters
        hiring={hiring}
        size={size}
        topics={topics}
        query={query}
        onHiringChange={setHiring}
        onSizeChange={setSize}
        onTopicsChange={setTopics}
        onQueryChange={setQuery}
        onClear={clear}
      />

      {loading && companies.length === 0 ? (
        <Spinner />
      ) : error ? (
        <EmptyState icon="⚠️" title="Couldn't load companies" subtitle={error} />
      ) : filtered.length === 0 ? (
        hasActiveFilters ? (
          <div>
            <EmptyState
              title="No companies match those filters"
              subtitle="Try broadening a filter or clearing them all."
            />
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Button variant="outline" size="sm" onClick={clear}>
                Clear filters
              </Button>
            </div>
          </div>
        ) : (
          <EmptyState
            title="No companies yet"
            subtitle="The directory is being populated — check back soon."
          />
        )
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '12px',
          }}
        >
          {filtered.map((company) => (
            <CompanyCard key={company.id} company={company} variant="compact" />
          ))}
        </div>
      )}
    </div>
  );
}
