import { describe, it, expect } from 'vitest';
import {
  formatDateBadge,
  formatEventDate,
  isNextMonth,
  isThisMonth,
  isThisWeek,
  isUpcoming,
} from './dates';

describe('formatEventDate', () => {
  it('formats an ISO date into human-friendly form', () => {
    expect(formatEventDate('2026-05-15T18:00:00-06:00')).toMatch(/May 15 · 6:00 PM/);
  });
});

describe('formatDateBadge', () => {
  it('returns uppercase month and day', () => {
    expect(formatDateBadge('2026-05-15T18:00:00-06:00')).toEqual({ month: 'MAY', day: '15' });
  });
});

describe('isUpcoming', () => {
  const now = new Date('2026-04-23T12:00:00-06:00');

  it('returns true for dates after now', () => {
    expect(isUpcoming('2026-05-01T12:00:00-06:00', now)).toBe(true);
  });

  it('returns false for dates before now', () => {
    expect(isUpcoming('2026-04-01T12:00:00-06:00', now)).toBe(false);
  });
});

describe('isThisWeek', () => {
  const now = new Date('2026-04-23T12:00:00-06:00');

  it('returns true for a date within the current week', () => {
    expect(isThisWeek('2026-04-24T18:00:00-06:00', now)).toBe(true);
  });

  it('returns false for a date outside the current week', () => {
    expect(isThisWeek('2026-05-10T18:00:00-06:00', now)).toBe(false);
  });
});

describe('isThisMonth', () => {
  const now = new Date('2026-04-23T12:00:00-06:00');

  it('returns true for a date in the same month', () => {
    expect(isThisMonth('2026-04-01T12:00:00-06:00', now)).toBe(true);
    expect(isThisMonth('2026-04-30T12:00:00-06:00', now)).toBe(true);
  });

  it('returns false for a date in a different month', () => {
    expect(isThisMonth('2026-05-01T12:00:00-06:00', now)).toBe(false);
  });
});

describe('isNextMonth', () => {
  const now = new Date('2026-04-23T12:00:00-06:00');

  it('returns true for a date in the following calendar month', () => {
    expect(isNextMonth('2026-05-10T12:00:00-06:00', now)).toBe(true);
  });

  it('returns false for the current month or later months', () => {
    expect(isNextMonth('2026-04-25T12:00:00-06:00', now)).toBe(false);
    expect(isNextMonth('2026-06-10T12:00:00-06:00', now)).toBe(false);
  });
});
