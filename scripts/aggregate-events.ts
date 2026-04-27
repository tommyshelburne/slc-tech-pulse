import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

import type { Event } from '../src/types/event';
import { EVENT_SOURCES, type EventSource } from './event-sources';
import { normalizeEvent } from './event-normalize';
import { getAccessToken, isConfigured, readAuthEnv } from './meetup-auth';
import { fetchUpcomingEvents, gqlToICalEvent } from './meetup-fetch';

type NormalizedEvent = Omit<Event, 'id'> & { id: string };

async function fetchSource(
  source: EventSource,
  accessToken: string,
): Promise<NormalizedEvent[]> {
  const gqlEvents = await fetchUpcomingEvents(source.urlname, accessToken);
  const now = new Date();
  const events: NormalizedEvent[] = [];
  for (const gql of gqlEvents) {
    const ical = gqlToICalEvent(gql);
    const normalized = normalizeEvent(ical, source, { now });
    if (normalized) events.push(normalized);
  }
  return events;
}

async function deleteExistingMeetupEvents(db: FirebaseFirestore.Firestore): Promise<number> {
  const snap = await db.collection('events').where('source', '==', 'meetup').get();
  if (snap.empty) return 0;
  const batch = db.batch();
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  return snap.size;
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

  const env = readAuthEnv();
  if (!isConfigured(env)) {
    console.log('MEETUP_* secrets not set — skipping aggregation. See docs/meetup-setup.md.');
    process.exit(0);
  }

  console.log('Exchanging JWT for Meetup access token...');
  const accessToken = await getAccessToken(env);
  console.log('  ✓ token acquired\n');

  console.log(`Aggregating events from ${EVENT_SOURCES.length} groups...\n`);

  const seen = new Map<string, NormalizedEvent>();
  const errors: Array<{ source: string; error: string }> = [];

  for (const source of EVENT_SOURCES) {
    try {
      const events = await fetchSource(source, accessToken);
      let added = 0;
      for (const event of events) {
        if (!seen.has(event.id)) {
          seen.set(event.id, event);
          added++;
        }
      }
      console.log(`  ${source.name} (${source.urlname}): ${events.length} upcoming, ${added} new`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ ${source.name}: ${msg}`);
      errors.push({ source: source.name, error: msg });
    }
  }

  const allEvents = [...seen.values()].sort((a, b) => a.date.localeCompare(b.date));
  console.log(
    `\nTotal: ${allEvents.length} events from ${EVENT_SOURCES.length - errors.length}/${EVENT_SOURCES.length} groups`,
  );

  if (dryRun) {
    console.log('\n--dry-run: no Firestore writes. All events:');
    for (const e of allEvents) {
      const when = e.date.slice(0, 16).replace('T', ' ');
      console.log(`  - ${when} · ${e.title} · ${e.location}`);
    }
    process.exit(errors.length > 0 ? 1 : 0);
  }

  const serviceAccountPath =
    process.env.GOOGLE_APPLICATION_CREDENTIALS ?? resolve('.secrets/firebase-admin.json');
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  initializeApp({ credential: cert(serviceAccount) });
  const db = getFirestore();

  console.log('\nDeleting existing Meetup-sourced events...');
  const deleted = await deleteExistingMeetupEvents(db);
  console.log(`  deleted ${deleted}`);

  console.log(`Writing ${allEvents.length} fresh events...`);
  await writeEvents(db, allEvents);
  console.log('  ✓ done');

  if (errors.length > 0) {
    console.error(`\n${errors.length} group(s) failed — run was partial.`);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Aggregation failed:', err);
    process.exit(1);
  });
