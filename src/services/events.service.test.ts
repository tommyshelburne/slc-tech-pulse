import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { getDoc, getDocs } from 'firebase/firestore';
import { fetchEventById, fetchEvents } from './events.service';

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

describe('fetchEvents', () => {
  it('maps snapshot docs to Event objects with id', async () => {
    mockGetDocs.mockResolvedValueOnce({
      docs: [
        { id: 'evt-1', data: () => ({ title: 'React SLC', date: '2026-05-01' }) },
        { id: 'evt-2', data: () => ({ title: 'AI Meetup', date: '2026-05-10' }) },
      ],
    });

    const events = await fetchEvents();

    expect(events).toEqual([
      { id: 'evt-1', title: 'React SLC', date: '2026-05-01' },
      { id: 'evt-2', title: 'AI Meetup', date: '2026-05-10' },
    ]);
  });

  it('returns empty array when collection is empty', async () => {
    mockGetDocs.mockResolvedValueOnce({ docs: [] });
    expect(await fetchEvents()).toEqual([]);
  });
});

describe('fetchEventById', () => {
  it('returns the event when it exists', async () => {
    mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
      id: 'evt-1',
      data: () => ({ title: 'React SLC' }),
    });

    expect(await fetchEventById('evt-1')).toEqual({ id: 'evt-1', title: 'React SLC' });
  });

  it('returns null when the event does not exist', async () => {
    mockGetDoc.mockResolvedValueOnce({ exists: () => false });
    expect(await fetchEventById('missing')).toBeNull();
  });
});
