import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { getDoc, getDocs } from 'firebase/firestore';
import { fetchCompanies, fetchCompanyById } from './companies.service';

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  orderBy: vi.fn(),
  query: vi.fn(),
}));

vi.mock('./firebase', () => ({ db: {} }));

const mockGetDocs = getDocs as Mock;
const mockGetDoc = getDoc as Mock;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('fetchCompanies', () => {
  it('maps snapshot docs to Company objects with id', async () => {
    mockGetDocs.mockResolvedValueOnce({
      docs: [
        { id: 'lucid', data: () => ({ name: 'Lucid', location: 'South Jordan, UT' }) },
      ],
    });

    expect(await fetchCompanies()).toEqual([
      { id: 'lucid', name: 'Lucid', location: 'South Jordan, UT' },
    ]);
  });
});

describe('fetchCompanyById', () => {
  it('returns the company when it exists', async () => {
    mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
      id: 'lucid',
      data: () => ({ name: 'Lucid' }),
    });

    expect(await fetchCompanyById('lucid')).toEqual({ id: 'lucid', name: 'Lucid' });
  });

  it('returns null when the company does not exist', async () => {
    mockGetDoc.mockResolvedValueOnce({ exists: () => false });
    expect(await fetchCompanyById('missing')).toBeNull();
  });
});
