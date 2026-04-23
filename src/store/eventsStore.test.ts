import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { fetchEvents } from '../services/events.service';
import { useEventsStore } from './eventsStore';
import type { Event } from '../types/event';

vi.mock('../services/events.service', () => ({
  fetchEvents: vi.fn(),
}));

const mockFetch = fetchEvents as Mock;

const baseEvent = (overrides: Partial<Event>): Event => ({
  id: '',
  title: '',
  description: '',
  shortDescription: '',
  date: '',
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

beforeEach(() => {
  useEventsStore.setState({ events: [], loading: false, error: null });
  vi.clearAllMocks();
});

describe('useEventsStore.fetchEvents', () => {
  it('populates events on success', async () => {
    const events = [baseEvent({ id: 'a', date: '2026-05-01' })];
    mockFetch.mockResolvedValueOnce(events);

    await useEventsStore.getState().fetchEvents();

    expect(useEventsStore.getState().events).toEqual(events);
    expect(useEventsStore.getState().loading).toBe(false);
    expect(useEventsStore.getState().error).toBeNull();
  });

  it('sets error message on failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network down'));

    await useEventsStore.getState().fetchEvents();

    expect(useEventsStore.getState().loading).toBe(false);
    expect(useEventsStore.getState().error).toBe('network down');
  });
});

describe('useEventsStore selectors', () => {
  beforeEach(() => {
    useEventsStore.setState({
      events: [
        baseEvent({ id: 'past', date: '2024-01-01', isFeatured: false }),
        baseEvent({ id: 'future-2', date: '2030-01-01', isFeatured: true }),
        baseEvent({ id: 'future-1', date: '2027-01-01', isFeatured: false }),
      ],
    });
  });

  it('getUpcoming returns only future events sorted by date ascending', () => {
    const upcoming = useEventsStore.getState().getUpcoming();
    expect(upcoming.map((e) => e.id)).toEqual(['future-1', 'future-2']);
  });

  it('getFeatured returns only featured events', () => {
    expect(useEventsStore.getState().getFeatured().map((e) => e.id)).toEqual(['future-2']);
  });

  it('getById returns the matching event or undefined', () => {
    expect(useEventsStore.getState().getById('future-1')?.id).toBe('future-1');
    expect(useEventsStore.getState().getById('missing')).toBeUndefined();
  });
});
