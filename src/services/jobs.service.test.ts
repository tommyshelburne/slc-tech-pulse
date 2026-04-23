import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { getDoc, getDocs } from 'firebase/firestore';
import { fetchJobById, fetchJobs } from './jobs.service';

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

describe('fetchJobs', () => {
  it('maps snapshot docs to Job objects with id', async () => {
    mockGetDocs.mockResolvedValueOnce({
      docs: [
        { id: 'job-1', data: () => ({ title: 'Frontend Engineer', company: 'Lucid' }) },
      ],
    });

    expect(await fetchJobs()).toEqual([
      { id: 'job-1', title: 'Frontend Engineer', company: 'Lucid' },
    ]);
  });
});

describe('fetchJobById', () => {
  it('returns the job when it exists', async () => {
    mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
      id: 'job-1',
      data: () => ({ title: 'Frontend Engineer' }),
    });

    expect(await fetchJobById('job-1')).toEqual({ id: 'job-1', title: 'Frontend Engineer' });
  });

  it('returns null when the job does not exist', async () => {
    mockGetDoc.mockResolvedValueOnce({ exists: () => false });
    expect(await fetchJobById('missing')).toBeNull();
  });
});
