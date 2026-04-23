import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import EventDetailPage from './EventDetailPage';
import { useEventsStore } from '../store/eventsStore';
import { fetchEvents } from '../services/events.service';
import type { Event } from '../types/event';

vi.mock('../services/events.service', () => ({ fetchEvents: vi.fn() }));

const mockFetch = fetchEvents as Mock;

const makeEvent = (overrides: Partial<Event>): Event => ({
  id: '',
  title: '',
  description: '',
  shortDescription: '',
  date: '2026-05-15T18:00:00-06:00',
  location: 'Salt Lake City, UT',
  isOnline: false,
  url: 'https://example.com',
  topics: [],
  isFeatured: false,
  source: 'manual',
  createdAt: '',
  updatedAt: '',
  ...overrides,
});

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/events/:id" element={<EventDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  useEventsStore.setState({ events: [], loading: false, error: null });
  mockFetch.mockResolvedValue([]);
  vi.clearAllMocks();
});

describe('EventDetailPage', () => {
  const primaryEvent = makeEvent({
    id: 'react-slc-may',
    title: 'React SLC May Meetup',
    description: 'Full long-form event description.\n\nWith multiple paragraphs.',
    date: '2026-05-15T18:00:00-06:00',
    location: 'Salt Lake City, UT',
    venue: 'Impact Hub SLC',
    isOnline: false,
    url: 'https://example.com/react-slc',
    topics: ['React', 'TypeScript'],
    company: 'React SLC',
    source: 'meetup',
  });

  it('renders the selected event with title, date, location, and Register link', () => {
    useEventsStore.setState({ events: [primaryEvent] });
    renderAt('/events/react-slc-may');

    expect(screen.getByRole('heading', { level: 1, name: /react slc may meetup/i })).toBeInTheDocument();
    expect(screen.getAllByText(/May 15/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Salt Lake City/).length).toBeGreaterThan(0);
    const register = screen.getByRole('link', { name: /register/i });
    expect(register).toHaveAttribute('href', 'https://example.com/react-slc');
    expect(register).toHaveAttribute('target', '_blank');
  });

  it('renders the description and info sidebar rows', () => {
    useEventsStore.setState({ events: [primaryEvent] });
    renderAt('/events/react-slc-may');

    expect(screen.getByText(/Full long-form event description/)).toBeInTheDocument();
    const sidebar = screen.getByRole('complementary', { name: /event info/i });
    expect(within(sidebar).getByText('Date')).toBeInTheDocument();
    expect(within(sidebar).getByText('Venue')).toBeInTheDocument();
    expect(within(sidebar).getByText('Impact Hub SLC')).toBeInTheDocument();
    expect(within(sidebar).getByText('Organizer')).toBeInTheDocument();
    expect(within(sidebar).getByText('React SLC')).toBeInTheDocument();
    expect(within(sidebar).getByText('React')).toBeInTheDocument();
  });

  it('renders a back link to /events', () => {
    useEventsStore.setState({ events: [primaryEvent] });
    renderAt('/events/react-slc-may');
    const back = screen.getByRole('link', { name: /back to events/i });
    expect(back).toHaveAttribute('href', '/events');
  });

  it('shows related events sharing a topic, excluding the current event, capped at 3', () => {
    const related1 = makeEvent({ id: 'r1', title: 'React Workshop', topics: ['React'] });
    const related2 = makeEvent({ id: 'r2', title: 'TypeScript Talk', topics: ['TypeScript'] });
    const related3 = makeEvent({ id: 'r3', title: 'React Deep Dive', topics: ['React', 'Backend'] });
    const related4 = makeEvent({ id: 'r4', title: 'Another React Meet', topics: ['React'] });
    const unrelated = makeEvent({ id: 'u1', title: 'Design Night', topics: ['Design'] });

    useEventsStore.setState({
      events: [primaryEvent, related1, related2, related3, related4, unrelated],
    });

    renderAt('/events/react-slc-may');

    const relatedSection = screen.getByRole('region', { name: /related events/i });
    const names = within(relatedSection)
      .getAllByRole('heading')
      .map((h) => h.textContent);

    expect(names).toContain('Related events');
    expect(names.filter((n) => n !== 'Related events')).toHaveLength(3);
    expect(names).not.toContain(primaryEvent.title);
    expect(within(relatedSection).queryByText(/design night/i)).not.toBeInTheDocument();
  });

  it('omits the related-events section when nothing shares a topic', () => {
    const solo = makeEvent({ id: 'solo', topics: ['Design'] });
    useEventsStore.setState({ events: [primaryEvent, solo] });
    renderAt('/events/react-slc-may');
    expect(screen.queryByRole('region', { name: /related events/i })).not.toBeInTheDocument();
  });

  it('shows a not-found state for an unknown id once events are loaded', () => {
    useEventsStore.setState({ events: [primaryEvent], loading: false });
    renderAt('/events/does-not-exist');
    expect(screen.getByText(/event not found/i)).toBeInTheDocument();
    const browse = screen.getByRole('link', { name: /browse all events/i });
    expect(browse).toHaveAttribute('href', '/events');
  });

  it('shows a spinner while the store is loading with no events yet', () => {
    useEventsStore.setState({ events: [], loading: true });
    const { container } = renderAt('/events/react-slc-may');
    expect(container.querySelector('[style*="animation: spin"]')).toBeInTheDocument();
  });

  it('shows online indicator when the event is online', () => {
    useEventsStore.setState({
      events: [
        makeEvent({
          id: 'online-ev',
          title: 'Online Event',
          isOnline: true,
          location: 'Online',
          topics: ['AI/ML'],
        }),
      ],
    });
    renderAt('/events/online-ev');
    expect(screen.getAllByText(/🌐 Online/).length).toBeGreaterThan(0);
  });

  it('triggers fetchEvents on mount when store is empty', () => {
    useEventsStore.setState({ events: [], loading: false });
    renderAt('/events/react-slc-may');
    expect(mockFetch).toHaveBeenCalledOnce();
  });
});
