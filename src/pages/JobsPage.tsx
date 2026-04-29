import { useEffect, useMemo } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useJobsStore } from '../store/jobsStore';
import { useUIStore } from '../store/uiStore';
import { JobCard } from '../components/jobs/JobCard';
import { JobFilters } from '../components/jobs/JobFilters';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { filterJobs } from '../utils/filters';
import { useJobFiltersUrlSync } from '../hooks/useJobFiltersUrlSync';

export default function JobsPage() {
  useDocumentTitle('Jobs');
  useJobFiltersUrlSync();

  const jobs = useJobsStore((s) => s.jobs);
  const loading = useJobsStore((s) => s.loading);
  const error = useJobsStore((s) => s.error);

  const type = useUIStore((s) => s.jobTypeFilter);
  const level = useUIStore((s) => s.jobLevelFilter);
  const location = useUIStore((s) => s.jobLocationFilter);
  const topics = useUIStore((s) => s.jobTopicFilter);
  const query = useUIStore((s) => s.searchQuery);
  const clearFilters = useUIStore((s) => s.clearFilters);

  useEffect(() => {
    const state = useJobsStore.getState();
    if (!state.loading && state.jobs.length === 0) {
      void state.fetchJobs();
    }
  }, []);

  const filtered = useMemo(
    () =>
      filterJobs(jobs, { type, level, location, topics, query }).sort(
        (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime(),
      ),
    [jobs, type, level, location, topics, query],
  );

  const hasActiveFilters =
    type !== 'all' ||
    level !== 'all' ||
    location !== 'all' ||
    topics.length > 0 ||
    query.trim().length > 0;

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
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Jobs</h1>
          <Badge label={`${filtered.length} shown`} />
        </div>
        <Button
          href="mailto:hello@slctechpulse.com?subject=Job%20submission"
          variant="outline"
          size="sm"
        >
          Submit a job
        </Button>
      </header>

      <JobFilters />

      {loading && jobs.length === 0 ? (
        <Spinner />
      ) : error ? (
        <EmptyState icon="⚠️" title="Couldn't load jobs" subtitle={error} />
      ) : filtered.length === 0 ? (
        hasActiveFilters ? (
          <div>
            <EmptyState
              title="No jobs match those filters"
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
            title="No jobs yet"
            subtitle="New roles land here as companies post them."
          />
        )
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} variant="full" />
          ))}
        </div>
      )}
    </div>
  );
}
