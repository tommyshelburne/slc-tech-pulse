import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { fetchCompanies } from '../services/companies.service';
import { useCompaniesStore } from './companiesStore';
import type { Company } from '../types/company';

vi.mock('../services/companies.service', () => ({
  fetchCompanies: vi.fn(),
}));

const mockFetch = fetchCompanies as Mock;

const baseCompany = (overrides: Partial<Company>): Company => ({
  id: '',
  name: '',
  description: '',
  website: '',
  location: '',
  size: 'mid',
  topics: [],
  isHiring: false,
  isFeatured: false,
  ...overrides,
});

beforeEach(() => {
  useCompaniesStore.setState({ companies: [], loading: false, error: null });
  vi.clearAllMocks();
});

describe('useCompaniesStore.fetchCompanies', () => {
  it('populates companies on success', async () => {
    const companies = [baseCompany({ id: 'a' })];
    mockFetch.mockResolvedValueOnce(companies);
    await useCompaniesStore.getState().fetchCompanies();
    expect(useCompaniesStore.getState().companies).toEqual(companies);
  });

  it('sets error message on failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('fail'));
    await useCompaniesStore.getState().fetchCompanies();
    expect(useCompaniesStore.getState().error).toBe('fail');
  });
});

describe('useCompaniesStore selectors', () => {
  beforeEach(() => {
    useCompaniesStore.setState({
      companies: [
        baseCompany({ id: 'not-hiring', isHiring: false, isFeatured: false }),
        baseCompany({ id: 'hiring-featured', isHiring: true, isFeatured: true }),
        baseCompany({ id: 'hiring-only', isHiring: true, isFeatured: false }),
      ],
    });
  });

  it('getHiring returns only hiring companies', () => {
    expect(
      useCompaniesStore.getState().getHiring().map((c) => c.id).sort(),
    ).toEqual(['hiring-featured', 'hiring-only']);
  });

  it('getFeatured returns only featured companies', () => {
    expect(useCompaniesStore.getState().getFeatured().map((c) => c.id)).toEqual([
      'hiring-featured',
    ]);
  });
});
