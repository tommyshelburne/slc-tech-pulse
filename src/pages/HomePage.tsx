import { useEffect, type ReactNode } from 'react';
import { useEventsStore } from '../store/eventsStore';
import { useJobsStore } from '../store/jobsStore';
import { useCompaniesStore } from '../store/companiesStore';
import { Hero } from '../components/home/Hero';
import { StatsStrip } from '../components/home/StatsStrip';
import { SectionHeader } from '../components/home/SectionHeader';
import { EventCard } from '../components/events/EventCard';
import { JobCard } from '../components/jobs/JobCard';
import { CompanyCard } from '../components/companies/CompanyCard';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { isThisWeek, isUpcoming } from '../utils/dates';

export default function HomePage() {
  const events = useEventsStore((s) => s.events);
  const eventsLoading = useEventsStore((s) => s.loading);
  const eventsError = useEventsStore((s) => s.error);

  const jobs = useJobsStore((s) => s.jobs);
  const jobsLoading = useJobsStore((s) => s.loading);
  const jobsError = useJobsStore((s) => s.error);

  const companies = useCompaniesStore((s) => s.companies);
  const companiesLoading = useCompaniesStore((s) => s.loading);
  const companiesError = useCompaniesStore((s) => s.error);

  useEffect(() => {
    const eventsState = useEventsStore.getState();
    if (!eventsState.loading && eventsState.events.length === 0) {
      void eventsState.fetchEvents();
    }
    const jobsState = useJobsStore.getState();
    if (!jobsState.loading && jobsState.jobs.length === 0) {
      void jobsState.fetchJobs();
    }
    const companiesState = useCompaniesStore.getState();
    if (!companiesState.loading && companiesState.companies.length === 0) {
      void companiesState.fetchCompanies();
    }
  }, []);

  const upcomingEvents = events.filter((e) => isUpcoming(e.date));
  const thisWeekCount = events.filter((e) => isThisWeek(e.date)).length;

  const featuredEvents = [...upcomingEvents]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4);
  const latestJobs = [...jobs]
    .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())
    .slice(0, 4);
  const hiringCompanies = companies.filter((c) => c.isHiring).slice(0, 6);

  const eventsLoaded = !eventsLoading && !eventsError;
  const jobsLoaded = !jobsLoading && !jobsError;
  const companiesLoaded = !companiesLoading && !companiesError;

  return (
    <div>
      <Hero />

      <StatsStrip
        stats={[
          { label: 'Upcoming Events', value: eventsLoaded ? upcomingEvents.length : 0 },
          { label: 'Open Jobs', value: jobsLoaded ? jobs.length : 0 },
          { label: 'Companies', value: companiesLoaded ? companies.length : 0 },
          { label: 'This Week', value: eventsLoaded ? thisWeekCount : 0 },
        ]}
      />

      <Section title="Upcoming Events" viewAllTo="/events">
        <Grid
          loading={eventsLoading && events.length === 0}
          error={eventsError}
          empty={featuredEvents.length === 0}
          emptyTitle="No upcoming events"
          emptySubtitle="Check back soon — new events are added daily."
          columns={2}
        >
          {featuredEvents.map((event) => (
            <EventCard key={event.id} event={event} variant="compact" />
          ))}
        </Grid>
      </Section>

      <Section title="Open Positions" viewAllTo="/jobs">
        <Grid
          loading={jobsLoading && jobs.length === 0}
          error={jobsError}
          empty={latestJobs.length === 0}
          emptyTitle="No open jobs"
          emptySubtitle="New postings land here daily."
          columns={2}
        >
          {latestJobs.map((job) => (
            <JobCard key={job.id} job={job} variant="compact" />
          ))}
        </Grid>
      </Section>

      <Section title="Companies Hiring" viewAllTo="/companies">
        <Grid
          loading={companiesLoading && companies.length === 0}
          error={companiesError}
          empty={hiringCompanies.length === 0}
          emptyTitle="No companies hiring"
          emptySubtitle="Hiring status updates weekly."
          columns={3}
        >
          {hiringCompanies.map((company) => (
            <CompanyCard key={company.id} company={company} variant="compact" />
          ))}
        </Grid>
      </Section>
    </div>
  );
}

interface SectionProps {
  title: string;
  viewAllTo: string;
  children: ReactNode;
}

function Section({ title, viewAllTo, children }: SectionProps) {
  return (
    <section style={{ marginBottom: '48px' }}>
      <SectionHeader title={title} viewAllTo={viewAllTo} />
      {children}
    </section>
  );
}

interface GridProps {
  loading: boolean;
  error: string | null;
  empty: boolean;
  emptyTitle: string;
  emptySubtitle: string;
  columns: 2 | 3;
  children: ReactNode;
}

function Grid({ loading, error, empty, emptyTitle, emptySubtitle, columns, children }: GridProps) {
  if (loading) return <Spinner />;
  if (error) {
    return (
      <EmptyState icon="⚠️" title="Couldn't load this section" subtitle={error} />
    );
  }
  if (empty) {
    return <EmptyState title={emptyTitle} subtitle={emptySubtitle} />;
  }
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: '12px',
      }}
    >
      {children}
    </div>
  );
}
