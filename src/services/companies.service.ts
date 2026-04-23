import { collection, doc, getDoc, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from './firebase';
import type { Company } from '../types/company';

const COLLECTION = 'companies';

export async function fetchCompanies(): Promise<Company[]> {
  const q = query(collection(db, COLLECTION), orderBy('name', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Company, 'id'>) }));
}

export async function fetchCompanyById(id: string): Promise<Company | null> {
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Company, 'id'>) };
}
