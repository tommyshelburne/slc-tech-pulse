import { describe, it, expect } from 'vitest';
import { formatVenue, gqlToICalEvent, type MeetupGqlEvent } from './meetup-fetch';

const BASE: MeetupGqlEvent = {
  id: 'gql-evt-1',
  title: 'React Lehi — May Edition',
  eventUrl: 'https://www.meetup.com/slcreact/events/302101010/',
  description: 'Hands-on with React Server Components.',
  dateTime: '2026-05-12T18:00:00-06:00',
  endTime: '2026-05-12T20:00:00-06:00',
  venue: { name: 'Adobe Building A', city: 'Lehi', state: 'UT' },
  onlineVenue: null,
};

describe('formatVenue', () => {
  it('joins name + city + state', () => {
    expect(formatVenue({ name: 'Adobe', city: 'Lehi', state: 'UT' })).toBe('Adobe, Lehi, UT');
  });

  it('skips empty parts', () => {
    expect(formatVenue({ name: 'Adobe', city: null, state: 'UT' })).toBe('Adobe, UT');
  });

  it('returns undefined for empty venue', () => {
    expect(formatVenue(null)).toBeUndefined();
    expect(formatVenue({})).toBeUndefined();
  });
});

describe('gqlToICalEvent', () => {
  it('maps physical-venue events to ICalEvent shape', () => {
    const ical = gqlToICalEvent(BASE);
    expect(ical.uid).toBe('gql-evt-1');
    expect(ical.summary).toBe('React Lehi — May Edition');
    expect(ical.url).toBe(BASE.eventUrl);
    expect(ical.location).toBe('Adobe Building A, Lehi, UT');
    expect(ical.start).toBe('2026-05-12T18:00:00-06:00');
    expect(ical.end).toBe('2026-05-12T20:00:00-06:00');
  });

  it('uses onlineVenue url as location when present', () => {
    const online: MeetupGqlEvent = {
      ...BASE,
      venue: null,
      onlineVenue: { url: 'https://zoom.us/j/123' },
    };
    const ical = gqlToICalEvent(online);
    expect(ical.location).toBe('https://zoom.us/j/123');
  });

  it('returns undefined location when neither venue nor onlineVenue has data', () => {
    const empty: MeetupGqlEvent = {
      ...BASE,
      venue: null,
      onlineVenue: { url: null },
    };
    const ical = gqlToICalEvent(empty);
    expect(ical.location).toBeUndefined();
  });

  it('omits end when endTime is null', () => {
    const noEnd: MeetupGqlEvent = { ...BASE, endTime: null };
    const ical = gqlToICalEvent(noEnd);
    expect(ical.end).toBeUndefined();
  });
});
