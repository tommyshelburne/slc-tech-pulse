import type { Event } from '../types/event';
import type {
  EventDateFilter,
  EventFormatFilter,
} from '../store/uiStore';
import { isThisMonth, isThisWeek, isNextMonth } from './dates';

interface EventFilters {
  topics: string[];
  date: EventDateFilter;
  format: EventFormatFilter;
  query: string;
}

export function filterEvents(
  events: Event[],
  filters: EventFilters,
  now: Date = new Date(),
): Event[] {
  const normalizedQuery = filters.query.trim().toLowerCase();

  return events.filter((event) => {
    if (filters.topics.length > 0) {
      const hasAny = filters.topics.some((topic) => event.topics.includes(topic));
      if (!hasAny) return false;
    }

    if (filters.format === 'online' && !event.isOnline) return false;
    if (filters.format === 'in-person' && event.isOnline) return false;

    if (filters.date === 'week' && !isThisWeek(event.date, now)) return false;
    if (filters.date === 'month' && !isThisMonth(event.date, now)) return false;
    if (filters.date === 'next-month' && !isNextMonth(event.date, now)) return false;

    if (normalizedQuery.length > 0) {
      const haystack = `${event.title} ${event.description} ${event.shortDescription}`.toLowerCase();
      if (!haystack.includes(normalizedQuery)) return false;
    }

    return true;
  });
}

export const EVENT_TOPIC_OPTIONS = [
  'React',
  'TypeScript',
  'AI/ML',
  'Networking',
  'Startup',
  'Backend',
  'DevOps',
  'Design',
  'Product',
] as const;

export const EVENT_DATE_OPTIONS: { value: EventDateFilter; label: string }[] = [
  { value: 'all', label: 'All dates' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
  { value: 'next-month', label: 'Next month' },
];

export const EVENT_FORMAT_OPTIONS: { value: EventFormatFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'in-person', label: 'In-person' },
  { value: 'online', label: 'Online' },
];
