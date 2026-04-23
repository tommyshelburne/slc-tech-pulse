import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatDateBadge } from '../../utils/dates';
import type { Event } from '../../types/event';

interface EventCardProps {
  event: Event;
  variant?: 'compact' | 'full';
}

export function EventCard({ event, variant = 'compact' }: EventCardProps) {
  const { month, day } = formatDateBadge(event.date);
  const topics = event.topics.slice(0, variant === 'compact' ? 2 : 4);

  const inner = (
    <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
      <div
        aria-hidden="true"
        style={{
          width: 48,
          height: 48,
          borderRadius: 'var(--radius-md)',
          background: 'var(--accent-solid)',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          lineHeight: 1,
        }}
      >
        <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.5px' }}>{month}</span>
        <span style={{ fontSize: '18px', fontWeight: 700, marginTop: '2px' }}>{day}</span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {variant === 'full' ? (
          <Link
            to={`/events/${event.id}`}
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            <h3
              style={{
                fontSize: '16px',
                fontWeight: 600,
                margin: '0 0 4px',
                color: 'var(--text-primary)',
              }}
            >
              {event.title}
            </h3>
          </Link>
        ) : (
          <h3
            style={{
              fontSize: '15px',
              fontWeight: 600,
              margin: '0 0 4px',
              color: 'var(--text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {event.title}
          </h3>
        )}
        {event.company && (
          <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '6px' }}>
            {event.company}
          </div>
        )}
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '13px',
            margin: '0 0 10px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {event.shortDescription}
        </p>
        <div
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            flexWrap: 'wrap',
            fontSize: '12px',
            color: 'var(--text-muted)',
          }}
        >
          <span>{event.isOnline ? '🌐 Online' : `📍 ${event.location}`}</span>
          {topics.map((topic) => (
            <Badge key={topic} label={topic} />
          ))}
          {variant === 'full' && (
            <a
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginLeft: 'auto', textDecoration: 'none' }}
            >
              <Button variant="outline" size="sm">
                View event page →
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );

  if (variant === 'compact') {
    return (
      <Link
        to={`/events/${event.id}`}
        style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}
      >
        <Card padding="16px" style={{ height: '100%' }}>
          {inner}
        </Card>
      </Link>
    );
  }

  return <Card padding="18px">{inner}</Card>;
}
