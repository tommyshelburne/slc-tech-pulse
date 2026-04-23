import {
  endOfMonth,
  endOfWeek,
  format,
  isWithinInterval,
  startOfMonth,
  startOfWeek,
  addMonths,
  isAfter,
} from 'date-fns';

export function formatEventDate(iso: string): string {
  return format(new Date(iso), 'EEE, MMM d · h:mm a');
}

export function formatDateBadge(iso: string): { month: string; day: string } {
  const d = new Date(iso);
  return { month: format(d, 'MMM').toUpperCase(), day: format(d, 'd') };
}

export function isUpcoming(iso: string, now: Date = new Date()): boolean {
  return isAfter(new Date(iso), now);
}

export function isThisWeek(iso: string, now: Date = new Date()): boolean {
  const d = new Date(iso);
  return isWithinInterval(d, { start: startOfWeek(now), end: endOfWeek(now) });
}

export function isThisMonth(iso: string, now: Date = new Date()): boolean {
  const d = new Date(iso);
  return isWithinInterval(d, { start: startOfMonth(now), end: endOfMonth(now) });
}

export function isNextMonth(iso: string, now: Date = new Date()): boolean {
  const next = addMonths(now, 1);
  const d = new Date(iso);
  return isWithinInterval(d, { start: startOfMonth(next), end: endOfMonth(next) });
}
