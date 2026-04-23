import { describe, it, expect } from 'vitest';
import { filterEvents } from './filters';
import type { Event } from '../types/event';

const NOW = new Date('2026-04-23T12:00:00-06:00');

const makeEvent = (overrides: Partial<Event>): Event => ({
  id: '',
  title: '',
  description: '',
  shortDescription: '',
  date: '2026-05-01T18:00:00-06:00',
  location: '',
  isOnline: false,
  url: '',
  topics: [],
  isFeatured: false,
  source: 'manual',
  createdAt: '',
  updatedAt: '',
  ...overrides,
});

const defaults = { topics: [], date: 'all' as const, format: 'all' as const, query: '' };

describe('filterEvents', () => {
  it('returns all events when no filters are set', () => {
    const events = [makeEvent({ id: 'a' }), makeEvent({ id: 'b' })];
    expect(filterEvents(events, defaults, NOW)).toEqual(events);
  });

  it('filters by a single topic', () => {
    const events = [
      makeEvent({ id: 'react', topics: ['React'] }),
      makeEvent({ id: 'ai', topics: ['AI/ML'] }),
    ];
    expect(filterEvents(events, { ...defaults, topics: ['React'] }, NOW).map((e) => e.id)).toEqual([
      'react',
    ]);
  });

  it('applies OR semantics across multiple topics', () => {
    const events = [
      makeEvent({ id: 'react', topics: ['React'] }),
      makeEvent({ id: 'ai', topics: ['AI/ML'] }),
      makeEvent({ id: 'design', topics: ['Design'] }),
    ];
    const result = filterEvents(events, { ...defaults, topics: ['React', 'AI/ML'] }, NOW);
    expect(result.map((e) => e.id).sort()).toEqual(['ai', 'react']);
  });

  it('filters by online format', () => {
    const events = [
      makeEvent({ id: 'in-person', isOnline: false }),
      makeEvent({ id: 'online', isOnline: true }),
    ];
    expect(
      filterEvents(events, { ...defaults, format: 'online' }, NOW).map((e) => e.id),
    ).toEqual(['online']);
  });

  it('filters by in-person format', () => {
    const events = [
      makeEvent({ id: 'in-person', isOnline: false }),
      makeEvent({ id: 'online', isOnline: true }),
    ];
    expect(
      filterEvents(events, { ...defaults, format: 'in-person' }, NOW).map((e) => e.id),
    ).toEqual(['in-person']);
  });

  it('filters by this week', () => {
    const events = [
      makeEvent({ id: 'this-week', date: '2026-04-24T18:00:00-06:00' }),
      makeEvent({ id: 'next-month', date: '2026-05-24T18:00:00-06:00' }),
    ];
    expect(
      filterEvents(events, { ...defaults, date: 'week' }, NOW).map((e) => e.id),
    ).toEqual(['this-week']);
  });

  it('matches query against title and description case-insensitively', () => {
    const events = [
      makeEvent({ id: 'react', title: 'React Meetup', description: '' }),
      makeEvent({ id: 'go', title: 'Go Users', description: 'learn Go' }),
      makeEvent({ id: 'lucid', title: 'Hackathon', description: 'hosted by Lucid Software' }),
    ];
    expect(filterEvents(events, { ...defaults, query: 'REACT' }, NOW).map((e) => e.id)).toEqual([
      'react',
    ]);
    expect(filterEvents(events, { ...defaults, query: 'lucid' }, NOW).map((e) => e.id)).toEqual([
      'lucid',
    ]);
  });

  it('combines all active filters with AND semantics', () => {
    const events = [
      makeEvent({
        id: 'match',
        topics: ['React'],
        isOnline: true,
        date: '2026-04-24T18:00:00-06:00',
        title: 'React Workshop',
      }),
      makeEvent({
        id: 'wrong-topic',
        topics: ['Design'],
        isOnline: true,
        date: '2026-04-24T18:00:00-06:00',
        title: 'React Workshop',
      }),
      makeEvent({
        id: 'wrong-format',
        topics: ['React'],
        isOnline: false,
        date: '2026-04-24T18:00:00-06:00',
        title: 'React Workshop',
      }),
      makeEvent({
        id: 'wrong-date',
        topics: ['React'],
        isOnline: true,
        date: '2026-06-24T18:00:00-06:00',
        title: 'React Workshop',
      }),
    ];

    const result = filterEvents(
      events,
      { topics: ['React'], date: 'week', format: 'online', query: 'react' },
      NOW,
    );
    expect(result.map((e) => e.id)).toEqual(['match']);
  });

  it('treats whitespace-only query as no query', () => {
    const events = [makeEvent({ id: 'a', title: 'Anything' })];
    expect(filterEvents(events, { ...defaults, query: '   ' }, NOW)).toEqual(events);
  });
});
