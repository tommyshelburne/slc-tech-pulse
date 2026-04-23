import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useEventsStore } from '../store/eventsStore';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { EventCard } from '../components/events/EventCard';
import { formatEventDate } from '../utils/dates';
import type { Event } from '../types/event';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();

  const events = useEventsStore((s) => s.events);
  const loading = useEventsStore((s) => s.loading);
  const error = useEventsStore((s) => s.error);

  const event = useMemo(() => events.find((e) => e.id === id), [events, id]);
  useDocumentTitle(event?.title ?? 'Event');

  useEffect(() => {
    const state = useEventsStore.getState();
    if (!state.loading && state.events.length === 0) {
      void state.fetchEvents();
    }
  }, []);

  const relatedEvents = useMemo<Event[]>(() => {
    if (!event) return [];
    return events
      .filter((e) => e.id !== event.id && e.topics.some((t) => event.topics.includes(t)))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  }, [events, event]);

  return (
    <div>
      <Link
        to="/events"
        style={{
          display: 'inline-block',
          color: 'var(--text-secondary)',
          fontSize: '13px',
          marginBottom: '16px',
        }}
      >
        ← Back to events
      </Link>

      {loading && events.length === 0 ? (
        <Spinner />
      ) : error ? (
        <EmptyState icon="⚠️" title="Couldn't load this event" subtitle={error} />
      ) : !event ? (
        <div>
          <EmptyState
            icon="🔍"
            title="Event not found"
            subtitle="The event you're looking for may have ended or been removed."
          />
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Link to="/events" style={{ textDecoration: 'none' }}>
              <Button variant="outline" size="sm">
                Browse all events
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <EventDetailBody event={event} relatedEvents={relatedEvents} />
      )}
    </div>
  );
}

interface BodyProps {
  event: Event;
  relatedEvents: Event[];
}

function EventDetailBody({ event, relatedEvents }: BodyProps) {
  return (
    <article>
      <section
        style={{
          padding: '32px',
          borderRadius: 'var(--radius-lg)',
          background:
            'linear-gradient(135deg, var(--accent-dim) 0%, var(--bg-surface) 100%)',
          border: '1px solid var(--border)',
          marginBottom: '24px',
        }}
      >
        <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 12px', lineHeight: 1.15 }}>
          {event.title}
        </h1>
        <div
          style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            color: 'var(--text-secondary)',
            fontSize: '14px',
            marginBottom: '20px',
          }}
        >
          <span>🗓 {formatEventDate(event.date)}</span>
          <span>{event.isOnline ? '🌐 Online' : `📍 ${event.location}`}</span>
          {event.company && <span>🏢 {event.company}</span>}
        </div>
        <a
          href={event.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none' }}
        >
          <Button variant="primary" size="md">
            View event page →
          </Button>
        </a>
      </section>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
          gap: '24px',
          marginBottom: '48px',
        }}
      >
        <section aria-label="Event description">
          <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 12px' }}>About</h2>
          <p
            style={{
              color: 'var(--text-primary)',
              fontSize: '15px',
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
              margin: 0,
            }}
          >
            {event.description}
          </p>
        </section>

        <aside aria-label="Event info">
          <Card padding="20px">
            <h2 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 16px' }}>Details</h2>
            <InfoRow label="Date" value={formatEventDate(event.date)} />
            {event.endDate && <InfoRow label="Ends" value={formatEventDate(event.endDate)} />}
            <InfoRow label="Format" value={event.isOnline ? 'Online' : 'In-person'} />
            {!event.isOnline && (
              <>
                <InfoRow label="City" value={event.location} />
                {event.venue && <InfoRow label="Venue" value={event.venue} />}
              </>
            )}
            {event.company && <InfoRow label="Organizer" value={event.company} />}
            <div style={{ marginTop: '16px' }}>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '8px',
                }}
              >
                Topics
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {event.topics.map((topic) => (
                  <Badge key={topic} label={topic} />
                ))}
              </div>
            </div>
          </Card>
        </aside>
      </div>

      {relatedEvents.length > 0 && (
        <section aria-label="Related events">
          <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 16px' }}>Related events</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '12px',
            }}
          >
            {relatedEvents.map((related) => (
              <EventCard key={related.id} event={related} variant="compact" />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '6px 0',
        borderBottom: '1px solid var(--border)',
        fontSize: '13px',
      }}
    >
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ color: 'var(--text-primary)', textAlign: 'right' }}>{value}</span>
    </div>
  );
}
