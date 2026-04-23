import { collection, doc, getDoc, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from './firebase';
import type { Job } from '../types/job';

const COLLECTION = 'jobs';

export async function fetchJobs(): Promise<Job[]> {
  const q = query(collection(db, COLLECTION), orderBy('postedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Job, 'id'>) }));
}

export async function fetchJobById(id: string): Promise<Job | null> {
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Job, 'id'>) };
}
