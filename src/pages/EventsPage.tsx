import { useEffect, useMemo } from 'react';
import { useEventsStore } from '../store/eventsStore';
import { useUIStore } from '../store/uiStore';
import { EventCard } from '../components/events/EventCard';
import { EventFilters } from '../components/events/EventFilters';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { filterEvents } from '../utils/filters';
import { useEventFiltersUrlSync } from '../hooks/useEventFiltersUrlSync';

export default function EventsPage() {
  useEventFiltersUrlSync();

  const events = useEventsStore((s) => s.events);
  const loading = useEventsStore((s) => s.loading);
  const error = useEventsStore((s) => s.error);

  const topics = useUIStore((s) => s.eventTopicFilter);
  const date = useUIStore((s) => s.eventDateFilter);
  const format = useUIStore((s) => s.eventFormatFilter);
  const query = useUIStore((s) => s.searchQuery);
  const clearFilters = useUIStore((s) => s.clearFilters);

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
        <a
          href="mailto:hello@slctechpulse.com?subject=Event%20submission"
          style={{ textDecoration: 'none' }}
        >
          <Button variant="outline" size="sm">
            Suggest an event
          </Button>
        </a>
      </header>

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
          <EmptyState
            title="No events yet"
            subtitle="Check back soon — new events are added daily."
          />
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
