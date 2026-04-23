import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import CompaniesPage from './CompaniesPage';
import { useCompaniesStore } from '../store/companiesStore';
import { useUIStore } from '../store/uiStore';
import { fetchCompanies } from '../services/companies.service';
import type { Company } from '../types/company';

vi.mock('../services/companies.service', () => ({ fetchCompanies: vi.fn() }));

const mockFetch = fetchCompanies as Mock;

const makeCompany = (overrides: Partial<Company>): Company => ({
  id: '',
  name: '',
  description: '',
  website: 'https://example.com',
  location: 'Lehi, UT',
  size: 'mid',
  topics: [],
  isHiring: false,
  isFeatured: false,
  ...overrides,
});

function LocationSpy() {
  const location = useLocation();
  return <div data-testid="location-search">{location.search}</div>;
}

function renderCompanies(initialEntry = '/companies') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <CompaniesPage />
      <LocationSpy />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  useCompaniesStore.setState({
    companies: [
      makeCompany({
        id: 'lucid',
        name: 'Lucid Software',
        description: 'Diagramming platform',
        size: 'large',
        topics: ['React', 'TypeScript'],
        isHiring: true,
      }),
      makeCompany({
        id: 'canopy',
        name: 'Canopy',
        description: 'Tax practice management',
        size: 'mid',
        topics: ['React', 'Node'],
        isHiring: true,
      }),
      makeCompany({
        id: 'dormant',
        name: 'Dormant Corp',
        description: 'Not hiring',
        size: 'startup',
        topics: ['Go'],
        isHiring: false,
      }),
    ],
    loading: false,
    error: null,
  });
  useUIStore.getState().clearFilters();
  mockFetch.mockResolvedValue([]);
  vi.clearAllMocks();
});

describe('CompaniesPage', () => {
  it('renders every company sorted alphabetically', () => {
    renderCompanies();
    expect(screen.getByRole('heading', { level: 1, name: /^companies$/i })).toBeInTheDocument();
    expect(screen.getByText('3 shown')).toBeInTheDocument();
    const names = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(names).toEqual(['Canopy', 'Dormant Corp', 'Lucid Software']);
  });

  it('filters to hiring only', async () => {
    renderCompanies();
    await userEvent.click(screen.getByRole('button', { name: /hiring only/i }));
    expect(screen.queryByRole('heading', { level: 3, name: /dormant/i })).not.toBeInTheDocument();
    expect(screen.getByText('2 shown')).toBeInTheDocument();
  });

  it('filters by size', async () => {
    renderCompanies();
    const sizeGroup = screen.getByRole('group', { name: 'Size filter' });
    await userEvent.click(within(sizeGroup).getByRole('button', { name: 'Startup' }));
    expect(screen.getByRole('heading', { level: 3, name: /dormant/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 3, name: /lucid/i })).not.toBeInTheDocument();
  });

  it('filters by search', async () => {
    renderCompanies();
    await userEvent.type(screen.getByPlaceholderText(/search name or description/i), 'lucid');
    expect(screen.getByRole('heading', { level: 3, name: /lucid/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 3, name: /canopy/i })).not.toBeInTheDocument();
  });

  it('combines hiring + size + search', async () => {
    renderCompanies();
    await userEvent.click(screen.getByRole('button', { name: /hiring only/i }));
    const sizeGroup = screen.getByRole('group', { name: 'Size filter' });
    await userEvent.click(within(sizeGroup).getByRole('button', { name: 'Large' }));
    await userEvent.type(screen.getByPlaceholderText(/search name or description/i), 'diagram');
    expect(screen.getByRole('heading', { level: 3, name: /lucid/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 3, name: /canopy/i })).not.toBeInTheDocument();
  });

  it('shows filters-empty state with Clear filters', async () => {
    renderCompanies();
    await userEvent.type(screen.getByPlaceholderText(/search name or description/i), 'zzzzz');
    expect(screen.getByText(/no companies match those filters/i)).toBeInTheDocument();
    const clears = screen.getAllByRole('button', { name: /clear filters/i });
    await userEvent.click(clears[0]);
    expect(screen.getByRole('heading', { level: 3, name: /lucid/i })).toBeInTheDocument();
  });

  it('shows error state on fetch failure', async () => {
    useCompaniesStore.setState({ companies: [], loading: false, error: null });
    mockFetch.mockRejectedValueOnce(new Error('network down'));
    renderCompanies();
    expect(await screen.findByText(/couldn't load companies/i)).toBeInTheDocument();
  });

  it('hydrates filters from URL params on mount', () => {
    renderCompanies('/companies?hiring=1&size=large');
    expect(screen.getByRole('button', { name: /hiring only/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    const sizeGroup = screen.getByRole('group', { name: 'Size filter' });
    expect(within(sizeGroup).getByRole('button', { name: 'Large' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('heading', { level: 3, name: /lucid/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 3, name: /canopy/i })).not.toBeInTheDocument();
  });

  it('reflects filter state in the URL', async () => {
    renderCompanies();
    await userEvent.click(screen.getByRole('button', { name: /hiring only/i }));
    expect(screen.getByTestId('location-search').textContent).toBe('?hiring=1');
  });
});
