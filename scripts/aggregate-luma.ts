import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

import type { Event } from '../src/types/event';

const SERVICE_ACCOUNT_PATH =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ?? resolve('.secrets/firebase-admin.json');

// lu.ma's public discover API. No auth. Returns Utah-region events (the
// city_slug param is ignored server-side — all UT cities resolve to the
// same regional feed).
const DISCOVER_URL =
  'https://api.lu.ma/discover/get-paginated-events?city_slug=salt-lake-city';

interface LumaGeoAddress {
  city?: string | null;
  region?: string | null;
  full_address?: string | null;
  city_state?: string | null;
}

interface LumaEvent {
  api_id: string;
  name: string;
  start_at: string;
  end_at?: string | null;
  url: string; // event slug fragment, e.g. "g82iyh8h" → https://lu.ma/g82iyh8h
  location_type?: 'offline' | 'online' | string;
  visibility?: string;
  geo_address_info?: LumaGeoAddress | null;
  timezone?: string | null;
}

interface LumaCalendar {
  api_id: string;
  name?: string | null;
  slug?: string | null;
}

interface LumaEntry {
  api_id: string;
  event: LumaEvent;
  calendar?: LumaCalendar | null;
}

interface LumaResponse {
  entries: LumaEntry[];
  has_more: boolean;
  next_cursor?: string | null;
}

// Strong tech signals — direct subject hit.
const TECH_INCLUDE = [
  /\bai\b/i,
  /\bml\b/i,
  /machine learning/i,
  /\bllm\b/i,
  /\bgpt\b/i,
  /\bgenai\b/i,
  /\bnlp\b/i,
  /engineer/i,
  /developer/i,
  /software/i,
  /\bdev\b/i,
  /\bcode\b/i,
  /coding/i,
  /programming/i,
  /hackathon/i,
  /startup/i,
  /founder/i,
  /\bvc\b/i,
  /venture/i,
  /demo day/i,
  /pitch/i,
  /product manager/i,
  /\bpm\b/i,
  /designer/i,
  /\bux\b/i,
  /\bui\b/i,
  /design week/i,
  /\bdata\b/i,
  /\bsaas\b/i,
  /\bapi\b/i,
  /\bweb3\b/i,
  /blockchain/i,
  /crypto/i,
  /cyber/i,
  /infosec/i,
  /security/i,
  /react/i,
  /python/i,
  /javascript/i,
  /typescript/i,
  /\bnode\b/i,
  /\.net/i,
  /devops/i,
  /platform/i,
  /infrastructure/i,
  /biohive/i,
  /healthtech/i,
  /fintech/i,
  /edtech/i,
  /silicon slopes/i,
  /tech tuesday/i,
  /ai collective/i,
];

// Hard excludes — even if a TECH_INCLUDE pattern matches, these kill the entry.
// These are common Utah lu.ma chaff (yoga, hikes, wine nights) that incidentally
// trip on words like "founder" or "social".
const HARD_EXCLUDE = [
  /\byoga\b/i,
  /\bhike\b|\bhiking\b/i,
  /\bbrunch\b/i,
  /wine/i,
  /\bgolf\b/i,
  /\bcookout\b/i,
  /networking in nature/i,
  /pickleball/i,
  /soir[eé]e/i,
  /storytelling/i,
  /\bretreat\b/i,
  /master claw/i,
];

function looksLikeTech(name: string): boolean {
  if (HARD_EXCLUDE.some((re) => re.test(name))) return false;
  return TECH_INCLUDE.some((re) => re.test(name));
}

const TOPIC_MAP: Array<[RegExp, string]> = [
  [/\bai\b|\bml\b|machine learning|\bllm\b|\bgpt\b|genai/i, 'AI/ML'],
  [/react|frontend|front[- ]end/i, 'React'],
  [/typescript/i, 'TypeScript'],
  [/javascript|\bjs\b/i, 'JavaScript'],
  [/python/i, 'Python'],
  [/node(\.js)?/i, 'Node'],
  [/devops|sre|platform|infrastructure/i, 'DevOps'],
  [/data\b|analytics|data engineer|data scientist/i, 'Data'],
  [/\bux\b|\bui\b|design/i, 'Design'],
  [/product/i, 'Product'],
  [/security|cyber|infosec/i, 'Security'],
  [/startup|founder|\bvc\b|venture|demo day|pitch/i, 'Startup'],
  [/healthtech|biohive|biotech/i, 'Healthcare'],
  [/fintech/i, 'Fintech'],
  [/networking|mixer|happy hour/i, 'Networking'],
  [/hackathon/i, 'Hackathon'],
];

function inferTopics(name: string): string[] {
  const found = new Set<string>();
  for (const [re, topic] of TOPIC_MAP) {
    if (re.test(name)) found.add(topic);
  }
  // Always tag networking-style words even when other topics present.
  return [...found];
}

interface NormalizedEvent extends Omit<Event, 'id'> {
  id: string;
}

function buildLocation(info?: LumaGeoAddress | null): string {
  if (!info) return 'Utah';
  if (info.city_state) return info.city_state;
  const parts = [info.city, info.region].filter(Boolean);
  return parts.join(', ') || 'Utah';
}

function normalize(entry: LumaEntry, now: Date): NormalizedEvent | null {
  const ev = entry.event;
  if (ev.visibility && ev.visibility !== 'public') return null;
  if (!ev.start_at) return null;
  const startMs = Date.parse(ev.start_at);
  if (Number.isNaN(startMs)) return null;
  // Skip events that already started >2h ago (lu.ma sometimes returns recent
  // history at the head of the feed).
  if (startMs < now.getTime() - 2 * 60 * 60 * 1000) return null;

  if (!looksLikeTech(ev.name)) return null;

  const isOnline = ev.location_type === 'online' || ev.location_type === 'virtual';
  const url = `https://lu.ma/${ev.url}`;
  const nowIso = now.toISOString();

  const base: NormalizedEvent = {
    id: `luma-${ev.api_id}`,
    title: ev.name.trim(),
    shortDescription: `Hosted via lu.ma${entry.calendar?.name ? ` · ${entry.calendar.name}` : ''}.`,
    description: `Event listing pulled from lu.ma. Visit the event page for full details, RSVPs, and venue specifics.`,
    date: ev.start_at,
    location: buildLocation(ev.geo_address_info),
    isOnline,
    url,
    topics: inferTopics(ev.name),
    isFeatured: false,
    source: 'luma',
    createdAt: nowIso,
    updatedAt: nowIso,
  };
  if (ev.end_at) base.endDate = ev.end_at;
  if (ev.geo_address_info?.full_address) base.venue = ev.geo_address_info.full_address;
  return base;
}

async function fetchAll(): Promise<LumaEntry[]> {
  const all: LumaEntry[] = [];
  let cursor: string | null = null;
  for (let page = 0; page < 20; page++) {
    const url = cursor ? `${DISCOVER_URL}&pagination_cursor=${encodeURIComponent(cursor)}` : DISCOVER_URL;
    const res = await fetch(url, { headers: { 'User-Agent': 'slc-tech-pulse-aggregator/1.0' } });
    if (!res.ok) throw new Error(`lu.ma discover ${res.status}`);
    const data = (await res.json()) as LumaResponse;
    all.push(...data.entries);
    if (!data.has_more || !data.next_cursor) break;
    cursor = data.next_cursor;
  }
  return all;
}

async function deleteExistingLumaEvents(db: FirebaseFirestore.Firestore): Promise<number> {
  const snap = await db.collection('events').where('source', '==', 'luma').get();
  if (snap.empty) return 0;
  let deleted = 0;
  for (let i = 0; i < snap.docs.length; i += 400) {
    const chunk = snap.docs.slice(i, i + 400);
    const batch = db.batch();
    chunk.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    deleted += chunk.length;
  }
  return deleted;
}

async function writeEvents(
  db: FirebaseFirestore.Firestore,
  events: NormalizedEvent[],
): Promise<void> {
  if (events.length === 0) return;
  for (let i = 0; i < events.length; i += 400) {
    const chunk = events.slice(i, i + 400);
    const batch = db.batch();
    for (const event of chunk) {
      const { id, ...data } = event;
      batch.set(db.collection('events').doc(id), data);
    }
    await batch.commit();
  }
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run');
  const now = new Date();

  console.log('Fetching SLC region events from lu.ma...');
  const entries = await fetchAll();
  console.log(`  fetched ${entries.length} total entries`);

  const seen = new Map<string, NormalizedEvent>();
  for (const entry of entries) {
    const normalized = normalize(entry, now);
    if (normalized && !seen.has(normalized.id)) {
      seen.set(normalized.id, normalized);
    }
  }
  const events = [...seen.values()].sort((a, b) => a.date.localeCompare(b.date));
  console.log(`  ${events.length} pass tech filter\n`);

  for (const e of events) {
    console.log(`  ${e.date.slice(0, 16)} · ${e.title.slice(0, 60)} · ${e.location}`);
  }

  if (dryRun) {
    console.log('\n--dry-run: no Firestore writes.');
    process.exit(0);
  }

  const serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
  initializeApp({ credential: cert(serviceAccount) });
  const db = getFirestore();

  console.log('\nDeleting existing lu.ma events...');
  const deleted = await deleteExistingLumaEvents(db);
  console.log(`  deleted ${deleted}`);

  console.log(`Writing ${events.length} fresh events...`);
  await writeEvents(db, events);
  console.log('  ✓ done');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('lu.ma aggregation failed:', err);
    process.exit(1);
  });
