import { describe, it, expect } from 'vitest';
import { buildEventId, normalizeEvent } from './event-normalize';
import type { EventSource } from './event-sources';
import type { ICalEvent } from './ical';

const SOURCE: EventSource = {
  urlname: 'slcreact',
  name: 'SLC React',
  defaultLocation: 'Salt Lake City, UT',
  fallbackUrl: 'https://www.meetup.com/slcreact/events/',
};

const NOW = new Date('2026-04-01T00:00:00Z');

function baseIcal(overrides: Partial<ICalEvent> = {}): ICalEvent {
  return {
    uid: 'event-123@meetup.com',
    summary: 'React SLC — April',
    description: 'Talks on React 19 and AI tooling.',
    location: 'Lehi, UT',
    url: 'https://www.meetup.com/slcreact/events/999',
    start: '2026-04-10T18:00:00.000Z',
    end: '2026-04-10T20:00:00.000Z',
    ...overrides,
  };
}

describe('buildEventId', () => {
  it('is deterministic for the same UID', () => {
    expect(buildEventId('meetup', 'slcreact', 'u1')).toBe(buildEventId('meetup', 'slcreact', 'u1'));
  });

  it('differs across UIDs', () => {
    expect(buildEventId('meetup', 'slcreact', 'u1')).not.toBe(
      buildEventId('meetup', 'slcreact', 'u2'),
    );
  });
});

describe('normalizeEvent', () => {
  it('normalizes a standard upcoming event', () => {
    const event = normalizeEvent(baseIcal(), SOURCE, { now: NOW });
    expect(event).not.toBeNull();
    expect(event!.title).toBe('React SLC — April');
    expect(event!.date).toBe('2026-04-10T18:00:00.000Z');
    expect(event!.endDate).toBe('2026-04-10T20:00:00.000Z');
    expect(event!.location).toBe('Lehi, UT');
    expect(event!.isOnline).toBe(false);
    expect(event!.source).toBe('meetup');
    expect(event!.company).toBe('SLC React');
    expect(event!.topics).toContain('React');
    expect(event!.topics).toContain('AI/ML');
  });

  it('drops events that ended more than 24h ago', () => {
    const old = baseIcal({ start: '2026-03-20T18:00:00.000Z' });
    expect(normalizeEvent(old, SOURCE, { now: NOW })).toBeNull();
  });

  it('keeps events starting within the last 24h (assumes still ongoing)', () => {
    const recent = baseIcal({
      start: new Date(NOW.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    });
    expect(normalizeEvent(recent, SOURCE, { now: NOW })).not.toBeNull();
  });

  it('detects online events from location keywords', () => {
    const online = baseIcal({ location: 'Online — Zoom' });
    const e = normalizeEvent(online, SOURCE, { now: NOW });
    expect(e!.isOnline).toBe(true);
  });

  it('detects online events from URL-as-location', () => {
    const online = baseIcal({ location: 'https://zoom.us/j/123' });
    const e = normalizeEvent(online, SOURCE, { now: NOW });
    expect(e!.isOnline).toBe(true);
  });

  it('drops events explicitly in other US states', () => {
    const denver = baseIcal({ location: 'Denver, CO' });
    expect(normalizeEvent(denver, SOURCE, { now: NOW })).toBeNull();
  });

  it('falls back to source defaults when location and url are missing', () => {
    const sparse = baseIcal({ location: undefined, url: undefined });
    const e = normalizeEvent(sparse, SOURCE, { now: NOW });
    expect(e!.location).toBe('Salt Lake City, UT');
    expect(e!.url).toBe('https://www.meetup.com/slcreact/events/');
  });

  it('omits endDate entirely when DTEND is absent (Firestore rejects undefined)', () => {
    const noEnd = baseIcal({ end: undefined });
    const e = normalizeEvent(noEnd, SOURCE, { now: NOW }) as Record<string, unknown>;
    expect('endDate' in e).toBe(false);
  });

  it('returns null when DTSTART is missing or invalid', () => {
    expect(normalizeEvent(baseIcal({ start: undefined }), SOURCE, { now: NOW })).toBeNull();
    expect(normalizeEvent(baseIcal({ start: 'not-a-date' }), SOURCE, { now: NOW })).toBeNull();
  });

  it('strips HTML tags and decodes entities in descriptions', () => {
    const html = baseIcal({
      description: 'Join us for <b>React</b> &amp; <i>AI</i> talks',
    });
    const e = normalizeEvent(html, SOURCE, { now: NOW });
    expect(e!.description).toBe('Join us for React & AI talks');
  });
});
