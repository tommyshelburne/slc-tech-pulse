import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './HomePage';
import { useEventsStore } from '../store/eventsStore';
import { useJobsStore } from '../store/jobsStore';
import { useCompaniesStore } from '../store/companiesStore';
import { fetchEvents } from '../services/events.service';
import { fetchJobs } from '../services/jobs.service';
import { fetchCompanies } from '../services/companies.service';
import type { Event } from '../types/event';
import type { Job } from '../types/job';
import type { Company } from '../types/company';

vi.mock('../services/events.service', () => ({ fetchEvents: vi.fn() }));
vi.mock('../services/jobs.service', () => ({ fetchJobs: vi.fn() }));
vi.mock('../services/companies.service', () => ({ fetchCompanies: vi.fn() }));

const mockFetchEvents = fetchEvents as Mock;
const mockFetchJobs = fetchJobs as Mock;
const mockFetchCompanies = fetchCompanies as Mock;

const makeEvent = (overrides: Partial<Event>): Event => ({
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

const makeJob = (overrides: Partial<Job>): Job => ({
  id: '',
  title: '',
  company: '',
  location: '',
  type: 'full-time',
  level: 'mid',
  description: '',
  url: 'https://example.com',
  topics: [],
  postedAt: '',
  isHighlighted: false,
  source: 'manual',
  ...overrides,
});

const makeCompany = (overrides: Partial<Company>): Company => ({
  id: '',
  name: '',
  description: '',
  website: 'https://example.com',
  location: '',
  size: 'mid',
  topics: [],
  isHiring: false,
  isFeatured: false,
  ...overrides,
});

function renderHome() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  useEventsStore.setState({ events: [], loading: false, error: null });
  useJobsStore.setState({ jobs: [], loading: false, error: null });
  useCompaniesStore.setState({ companies: [], loading: false, error: null });
  vi.clearAllMocks();
  mockFetchEvents.mockResolvedValue([]);
  mockFetchJobs.mockResolvedValue([]);
  mockFetchCompanies.mockResolvedValue([]);
});

describe('HomePage', () => {
  it('renders the hero and both CTAs', () => {
    renderHome();
    expect(
      screen.getByRole('heading', { level: 1, name: /what's happening in silicon slopes/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /browse events/i })).toHaveAttribute('href', '/events');
    expect(screen.getByRole('link', { name: /view jobs/i })).toHaveAttribute('href', '/jobs');
  });

  it('shows stats derived from the stores once data is loaded', () => {
    useEventsStore.setState({
      events: [
        makeEvent({ id: 'future', date: '2030-01-01T00:00:00Z' }),
        makeEvent({ id: 'past', date: '2020-01-01T00:00:00Z' }),
      ],
    });
    useJobsStore.setState({
      jobs: [makeJob({ id: 'j1' }), makeJob({ id: 'j2' }), makeJob({ id: 'j3' })],
    });
    useCompaniesStore.setState({
      companies: [makeCompany({ id: 'c1' }), makeCompany({ id: 'c2' })],
    });

    renderHome();

    const stats = within(screen.getByRole('list'));
    expect(stats.getByText('Upcoming Events').previousSibling).toHaveTextContent('1');
    expect(stats.getByText('Open Jobs').previousSibling).toHaveTextContent('3');
    expect(stats.getByText('Companies').previousSibling).toHaveTextContent('2');
  });

  it('renders the three section headers with View all links', () => {
    renderHome();
    const links = screen.getAllByRole('link', { name: /view all/i });
    const hrefs = links.map((el) => el.getAttribute('href'));
    expect(hrefs).toEqual(expect.arrayContaining(['/events', '/jobs', '/companies']));
  });

  it('renders up to four upcoming events sorted ascending by date', () => {
    useEventsStore.setState({
      events: [
        makeEvent({ id: 'e-late', title: 'Late', date: '2030-12-01T00:00:00Z' }),
        makeEvent({ id: 'e-early', title: 'Early', date: '2027-01-01T00:00:00Z' }),
        makeEvent({ id: 'e-mid', title: 'Mid', date: '2028-06-01T00:00:00Z' }),
        makeEvent({ id: 'e-past', title: 'Past', date: '2020-06-01T00:00:00Z' }),
      ],
    });

    renderHome();

    const earlyLink = screen.getByRole('link', { name: /^early/i });
    const midLink = screen.getByRole('link', { name: /^mid/i });
    const lateLink = screen.getByRole('link', { name: /^late/i });
    expect(earlyLink).toBeInTheDocument();
    expect(midLink).toBeInTheDocument();
    expect(lateLink).toBeInTheDocument();
    expect(screen.queryByText(/^Past$/)).not.toBeInTheDocument();
  });

  it('filters companies to only those hiring', () => {
    useCompaniesStore.setState({
      companies: [
        makeCompany({ id: 'hiring', name: 'Lucid Hiring Co', isHiring: true }),
        makeCompany({ id: 'not-hiring', name: 'Not Hiring Co', isHiring: false }),
      ],
    });

    renderHome();

    expect(screen.getByRole('heading', { name: /lucid hiring co/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /not hiring co/i })).not.toBeInTheDocument();
  });

  it('shows a spinner in each section while loading with no data yet', () => {
    useEventsStore.setState({ loading: true });
    useJobsStore.setState({ loading: true });
    useCompaniesStore.setState({ loading: true });

    const { container } = renderHome();
    // Each section has its own spinner (no data yet), so three total.
    const spinners = container.querySelectorAll(
      '[style*="animation: spin"]',
    );
    expect(spinners.length).toBeGreaterThanOrEqual(3);
  });

  it('shows an error empty-state when a fetch failed', async () => {
    mockFetchEvents.mockRejectedValueOnce(new Error('Network unreachable'));

    renderHome();

    expect(await screen.findByText(/couldn't load this section/i)).toBeInTheDocument();
    expect(screen.getByText(/network unreachable/i)).toBeInTheDocument();
  });

  it('shows empty-state messages when fetch succeeded but returned nothing', async () => {
    renderHome();

    expect(await screen.findByText(/no upcoming events/i)).toBeInTheDocument();
    expect(await screen.findByText(/no open jobs/i)).toBeInTheDocument();
    expect(await screen.findByText(/no companies hiring/i)).toBeInTheDocument();
  });

  it('triggers fetches on mount when stores are empty', () => {
    renderHome();
    expect(mockFetchEvents).toHaveBeenCalledOnce();
    expect(mockFetchJobs).toHaveBeenCalledOnce();
    expect(mockFetchCompanies).toHaveBeenCalledOnce();
  });

  it('does not re-fetch if stores already hold data', () => {
    useEventsStore.setState({ events: [makeEvent({ id: 'cached' })] });
    useJobsStore.setState({ jobs: [makeJob({ id: 'cached' })] });
    useCompaniesStore.setState({ companies: [makeCompany({ id: 'cached' })] });

    renderHome();

    expect(mockFetchEvents).not.toHaveBeenCalled();
    expect(mockFetchJobs).not.toHaveBeenCalled();
    expect(mockFetchCompanies).not.toHaveBeenCalled();
  });
});
