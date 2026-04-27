import { describe, it, expect } from 'vitest';
import { parseICal } from './ical';

const SAMPLE = [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'BEGIN:VEVENT',
  'UID:event-123@meetup.com',
  'SUMMARY:Utah React Meetup — April',
  'DESCRIPTION:Talks on React 19\\, server components\\, and more.',
  'LOCATION:Lehi\\, UT',
  'URL:https://www.meetup.com/slcreact/events/999',
  'DTSTART:20260410T180000Z',
  'DTEND:20260410T200000Z',
  'END:VEVENT',
  'BEGIN:VEVENT',
  'UID:event-456@meetup.com',
  'SUMMARY:Long Title That Wraps',
  ' Across Two Lines',
  'DTSTART;TZID=America/Denver:20260415T190000',
  'END:VEVENT',
  'END:VCALENDAR',
].join('\r\n');

describe('parseICal', () => {
  it('parses multiple VEVENTs', () => {
    const events = parseICal(SAMPLE);
    expect(events).toHaveLength(2);
  });

  it('unescapes commas in text fields', () => {
    const [first] = parseICal(SAMPLE);
    expect(first.description).toBe('Talks on React 19, server components, and more.');
    expect(first.location).toBe('Lehi, UT');
  });

  it('unfolds continuation lines', () => {
    const [, second] = parseICal(SAMPLE);
    expect(second.summary).toBe('Long Title That WrapsAcross Two Lines');
  });

  it('converts UTC DTSTART to ISO Z', () => {
    const [first] = parseICal(SAMPLE);
    expect(first.start).toBe('2026-04-10T18:00:00.000Z');
    expect(first.end).toBe('2026-04-10T20:00:00.000Z');
  });

  it('keeps local-time DTSTART without Z suffix', () => {
    const [, second] = parseICal(SAMPLE);
    expect(second.start).toBe('2026-04-15T19:00:00');
  });

  it('captures UID and URL', () => {
    const [first] = parseICal(SAMPLE);
    expect(first.uid).toBe('event-123@meetup.com');
    expect(first.url).toBe('https://www.meetup.com/slcreact/events/999');
  });

  it('ignores malformed VEVENTs with no UID or SUMMARY', () => {
    const bad = [
      'BEGIN:VCALENDAR',
      'BEGIN:VEVENT',
      'DTSTART:20260410T180000Z',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    expect(parseICal(bad)).toHaveLength(0);
  });
});
