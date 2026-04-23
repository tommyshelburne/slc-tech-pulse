import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import EventsPage from './EventsPage';
import { useEventsStore } from '../store/eventsStore';
import { useUIStore } from '../store/uiStore';
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

function LocationSpy() {
  const location = useLocation();
  return <div data-testid="location-search">{location.search}</div>;
}

function renderEvents(initialEntry = '/events') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <EventsPage />
      <LocationSpy />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  useEventsStore.setState({
    events: [
      makeEvent({
        id: 'react-meetup',
        title: 'React Meetup',
        topics: ['React', 'TypeScript'],
        date: '2026-05-15T18:00:00-06:00',
      }),
      makeEvent({
        id: 'ai-meetup',
        title: 'AI Meetup',
        topics: ['AI/ML'],
        isOnline: true,
        date: '2026-05-22T18:00:00-06:00',
      }),
      makeEvent({
        id: 'hackathon',
        title: 'Lucid Hackathon',
        topics: ['React', 'Startup'],
        date: '2026-06-13T09:00:00-06:00',
      }),
    ],
    loading: false,
    error: null,
  });
  useUIStore.getState().clearFilters();
  mockFetch.mockResolvedValue([]);
  vi.clearAllMocks();
});

describe('EventsPage', () => {
  it('renders every event by default and shows the count in the header', () => {
    renderEvents();
    expect(screen.getByRole('heading', { level: 1, name: /^events$/i })).toBeInTheDocument();
    expect(screen.getByText('3 shown')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /react meetup/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /ai meetup/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /lucid hackathon/i })).toBeInTheDocument();
  });

  it('filters by topic when pill toggled on', async () => {
    renderEvents();
    await userEvent.click(screen.getByRole('button', { name: 'AI/ML' }));
    expect(screen.getByRole('heading', { name: /ai meetup/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /react meetup/i })).not.toBeInTheDocument();
    expect(screen.getByText('1 shown')).toBeInTheDocument();
  });

  it('filters by format toggle', async () => {
    renderEvents();
    await userEvent.click(screen.getByRole('button', { name: 'Online' }));
    expect(screen.getByRole('heading', { name: /ai meetup/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /react meetup/i })).not.toBeInTheDocument();
  });

  it('narrows by search query against title', async () => {
    renderEvents();
    await userEvent.type(screen.getByPlaceholderText(/search event/i), 'lucid');
    expect(screen.getByRole('heading', { name: /lucid hackathon/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /react meetup/i })).not.toBeInTheDocument();
  });

  it('shows a filters-empty state with a Clear filters action when nothing matches', async () => {
    renderEvents();
    await userEvent.type(screen.getByPlaceholderText(/search event/i), 'zzzzz');
    expect(screen.getByText(/no events match those filters/i)).toBeInTheDocument();
    const clearButtons = screen.getAllByRole('button', { name: /clear filters/i });
    await userEvent.click(clearButtons[0]);
    expect(screen.getByRole('heading', { name: /react meetup/i })).toBeInTheDocument();
  });

  it('hydrates filter state from URL search params on mount', () => {
    renderEvents('/events?topic=React&format=in-person');
    // Only React events (react-meetup and hackathon), and format=in-person excludes online ones
    expect(screen.getByRole('heading', { name: /react meetup/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /lucid hackathon/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /ai meetup/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'React' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'In-person' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('reflects filter state in the URL query string', async () => {
    renderEvents();
    await userEvent.click(screen.getByRole('button', { name: 'React' }));
    expect(screen.getByTestId('location-search').textContent).toBe('?topic=React');
  });

  it('shows the loading spinner when fetching with no data yet', () => {
    useEventsStore.setState({ events: [], loading: true });
    const { container } = renderEvents();
    const spinner = container.querySelector('[style*="animation: spin"]');
    expect(spinner).toBeInTheDocument();
  });

  it('shows an error empty-state when the fetch fails', async () => {
    useEventsStore.setState({ events: [], loading: false, error: null });
    mockFetch.mockRejectedValueOnce(new Error('network down'));
    renderEvents();
    expect(await screen.findByText(/couldn't load events/i)).toBeInTheDocument();
    expect(screen.getByText(/network down/i)).toBeInTheDocument();
  });

  it('renders the Suggest an event link', () => {
    renderEvents();
    const link = screen.getByRole('link', { name: /suggest an event/i });
    expect(link).toHaveAttribute('href', expect.stringContaining('mailto:'));
  });
});
