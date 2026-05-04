import { useEffect, useMemo, useState } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useEventsStore } from '../store/eventsStore';
import { useUIStore } from '../store/uiStore';
import { EventCard } from '../components/events/EventCard';
import { EventFilters } from '../components/events/EventFilters';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SubmitDialog } from '../components/ui/SubmitDialog';
import { filterEvents } from '../utils/filters';
import { useEventFiltersUrlSync } from '../hooks/useEventFiltersUrlSync';

export default function EventsPage() {
  useDocumentTitle('Events');
  useEventFiltersUrlSync();

  const events = useEventsStore((s) => s.events);
  const loading = useEventsStore((s) => s.loading);
  const error = useEventsStore((s) => s.error);

  const topics = useUIStore((s) => s.eventTopicFilter);
  const date = useUIStore((s) => s.eventDateFilter);
  const format = useUIStore((s) => s.eventFormatFilter);
  const query = useUIStore((s) => s.searchQuery);
  const clearFilters = useUIStore((s) => s.clearFilters);

  const [submitOpen, setSubmitOpen] = useState(false);

  useEffect(() => {
    const state = useEventsStore.getState();
    if (!state.loading && state.events.length === 0) {
      void state.fetchEvents();
    }
  }, []);

  const filtered = useMemo(
    () =>
      filterEvents(events, { topics, date, format, query }).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      ),
    [events, topics, date, format, query],
  );

  const hasActiveFilters =
    topics.length > 0 || date !== 'all' || format !== 'all' || query.trim().length > 0;

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
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Events</h1>
          <Badge label={`${filtered.length} shown`} />
        </div>
        <Button variant="outline" size="sm" onClick={() => setSubmitOpen(true)}>
          Suggest an event
        </Button>
      </header>

      <SubmitDialog
        open={submitOpen}
        onClose={() => setSubmitOpen(false)}
        title="Suggest an event"
        intro="Organizing a meetup, conference, or hackathon in the SLC tech scene? Send us the details and we'll add it within 24 hours."
        checklist={[
          'Event page link (lu.ma, Eventbrite, Meetup, etc.)',
          'Title, date, and location',
          'A short description of what attendees can expect',
        ]}
        mailtoSubject="Event submission"
      />

      <EventFilters />

      {loading && events.length === 0 ? (
        <Spinner />
      ) : error ? (
        <EmptyState icon="⚠️" title="Couldn't load events" subtitle={error} />
      ) : filtered.length === 0 ? (
        hasActiveFilters ? (
          <div>
            <EmptyState
              title="No events match those filters"
              subtitle="Try removing a filter or clearing them all."
            />
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          </div>
        ) : (
          <UpstreamFallback />
        )
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} variant="full" />
          ))}
        </div>
      )}
    </div>
  );
}

const MEETUP_GROUPS: Array<{ name: string; url: string; description: string }> = [
  {
    name: 'Silicon Slopes',
    url: 'https://www.meetup.com/silicon-slopes/',
    description: 'The flagship Utah tech community. Talks, summits, and networking.',
  },
  {
    name: 'Utah JavaScript',
    url: 'https://www.meetup.com/utah-javascript-meetup/',
    description: 'JS / TS / Node talks and pizza.',
  },
  {
    name: 'SLC React',
    url: 'https://www.meetup.com/slcreact/',
    description: 'React patterns, deep dives, and community shop talk.',
  },
  {
    name: 'Utah Python User Group',
    url: 'https://www.meetup.com/utah-python-user-group/',
    description: 'Python from data science to web. Monthly meetups in SLC.',
  },
  {
    name: 'Utah AI/ML',
    url: 'https://www.meetup.com/utah-ai-ml-meetup/',
    description: 'Applied ML, LLMs, and Utah AI startups.',
  },
  {
    name: 'Women in Tech Utah',
    url: 'https://www.meetup.com/women-in-tech-utah/',
    description: 'Mixers, talks, and mentorship across Utah tech.',
  },
];

function UpstreamFallback() {
  return (
    <div>
      <EmptyState
        title="No events to show yet"
        subtitle="Our Meetup aggregator isn't running here yet. In the meantime, here are the Utah tech groups we'll be pulling from:"
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '10px',
          marginTop: '8px',
        }}
      >
        {MEETUP_GROUPS.map((g) => (
          <a
            key={g.url}
            href={g.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              textDecoration: 'none',
              color: 'var(--text-primary)',
              transition: 'border-color 0.15s ease',
            }}
          >
            <div
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--accent)',
                marginBottom: '4px',
              }}
            >
              {g.name} ↗
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {g.description}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
