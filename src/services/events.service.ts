import { collection, doc, getDoc, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from './firebase';
import type { Event } from '../types/event';

const COLLECTION = 'events';

export async function fetchEvents(): Promise<Event[]> {
  const q = query(collection(db, COLLECTION), orderBy('date', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Event, 'id'>) }));
}

export async function fetchEventById(id: string): Promise<Event | null> {
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Event, 'id'>) };
}
