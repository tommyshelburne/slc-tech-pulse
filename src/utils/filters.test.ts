import { describe, it, expect } from 'vitest';
import { filterEvents, filterJobs } from './filters';
import type { Event } from '../types/event';
import type { Job } from '../types/job';

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

const makeJob = (overrides: Partial<Job>): Job => ({
  id: '',
  title: '',
  company: '',
  location: 'Lehi, UT',
  type: 'full-time',
  level: 'mid',
  description: '',
  url: '',
  topics: [],
  postedAt: '',
  isHighlighted: false,
  source: 'manual',
  ...overrides,
});

const jobDefaults = {
  type: 'all' as const,
  level: 'all' as const,
  location: 'all' as const,
  topics: [],
  query: '',
};

describe('filterJobs', () => {
  it('returns all jobs with default filters', () => {
    const jobs = [makeJob({ id: 'a' }), makeJob({ id: 'b' })];
    expect(filterJobs(jobs, jobDefaults)).toEqual(jobs);
  });

  it('filters by type', () => {
    const jobs = [
      makeJob({ id: 'ft', type: 'full-time' }),
      makeJob({ id: 'intern', type: 'internship' }),
    ];
    expect(filterJobs(jobs, { ...jobDefaults, type: 'internship' }).map((j) => j.id)).toEqual([
      'intern',
    ]);
  });

  it('filters by level', () => {
    const jobs = [
      makeJob({ id: 'jr', level: 'junior' }),
      makeJob({ id: 'sr', level: 'senior' }),
    ];
    expect(filterJobs(jobs, { ...jobDefaults, level: 'senior' }).map((j) => j.id)).toEqual(['sr']);
  });

  it('filters by location category', () => {
    const jobs = [
      makeJob({ id: 'on-site', location: 'Lehi, UT' }),
      makeJob({ id: 'remote', location: 'Remote — US' }),
      makeJob({ id: 'hybrid', location: 'Hybrid — SLC' }),
    ];
    expect(filterJobs(jobs, { ...jobDefaults, location: 'remote' }).map((j) => j.id)).toEqual([
      'remote',
    ]);
    expect(filterJobs(jobs, { ...jobDefaults, location: 'hybrid' }).map((j) => j.id)).toEqual([
      'hybrid',
    ]);
    expect(filterJobs(jobs, { ...jobDefaults, location: 'on-site' }).map((j) => j.id)).toEqual([
      'on-site',
    ]);
  });

  it('OR-combines topic filters', () => {
    const jobs = [
      makeJob({ id: 'react', topics: ['React'] }),
      makeJob({ id: 'fin', topics: ['Fintech'] }),
      makeJob({ id: 'other', topics: ['Design'] }),
    ];
    const result = filterJobs(jobs, { ...jobDefaults, topics: ['React', 'Fintech'] });
    expect(result.map((j) => j.id).sort()).toEqual(['fin', 'react']);
  });

  it('searches title and company case-insensitively', () => {
    const jobs = [
      makeJob({ id: 'lucid', title: 'Frontend Engineer', company: 'Lucid Software' }),
      makeJob({ id: 'podium', title: 'Senior Engineer', company: 'Podium' }),
    ];
    expect(filterJobs(jobs, { ...jobDefaults, query: 'LUCID' }).map((j) => j.id)).toEqual([
      'lucid',
    ]);
  });

  it('AND-composes all active filters', () => {
    const jobs = [
      makeJob({
        id: 'match',
        type: 'full-time',
        level: 'senior',
        location: 'Remote — US',
        topics: ['React'],
        title: 'Staff SWE',
        company: 'Acme',
      }),
      makeJob({
        id: 'wrong-level',
        type: 'full-time',
        level: 'junior',
        location: 'Remote — US',
        topics: ['React'],
        title: 'Staff SWE',
        company: 'Acme',
      }),
    ];
    const result = filterJobs(jobs, {
      type: 'full-time',
      level: 'senior',
      location: 'remote',
      topics: ['React'],
      query: 'acme',
    });
    expect(result.map((j) => j.id)).toEqual(['match']);
  });
});
