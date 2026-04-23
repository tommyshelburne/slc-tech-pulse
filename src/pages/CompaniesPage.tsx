import { useEffect, useMemo } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useCompaniesStore } from '../store/companiesStore';
import { useUIStore } from '../store/uiStore';
import { CompanyCard } from '../components/companies/CompanyCard';
import { CompanyFilters } from '../components/companies/CompanyFilters';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { filterCompanies } from '../utils/filters';
import { useCompanyFiltersUrlSync } from '../hooks/useCompanyFiltersUrlSync';

export default function CompaniesPage() {
  useDocumentTitle('Companies');
  useCompanyFiltersUrlSync();

  const companies = useCompaniesStore((s) => s.companies);
  const loading = useCompaniesStore((s) => s.loading);
  const error = useCompaniesStore((s) => s.error);

  const hiring = useUIStore((s) => s.companyHiringFilter);
  const size = useUIStore((s) => s.companySizeFilter);
  const topics = useUIStore((s) => s.companyTopicFilter);
  const query = useUIStore((s) => s.searchQuery);
  const clearFilters = useUIStore((s) => s.clearFilters);

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

      <CompanyFilters />

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
              <Button variant="outline" size="sm" onClick={clearFilters}>
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
