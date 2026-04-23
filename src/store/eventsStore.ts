import { create } from 'zustand';
import { fetchEvents as fetchEventsService } from '../services/events.service';
import type { Event } from '../types/event';

interface EventsState {
  events: Event[];
  loading: boolean;
  error: string | null;
  fetchEvents: () => Promise<void>;
  getUpcoming: () => Event[];
  getFeatured: () => Event[];
  getById: (id: string) => Event | undefined;
}

export const useEventsStore = create<EventsState>((set, get) => ({
  events: [],
  loading: false,
  error: null,
  fetchEvents: async () => {
    set({ loading: true, error: null });
    try {
      const events = await fetchEventsService();
      set({ events, loading: false });
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : 'Failed to load events' });
    }
  },
  getUpcoming: () => {
    const now = Date.now();
    return get()
      .events.filter((e) => new Date(e.date).getTime() >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },
  getFeatured: () => get().events.filter((e) => e.isFeatured),
  getById: (id) => get().events.find((e) => e.id === id),
}));
