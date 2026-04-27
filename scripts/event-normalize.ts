import type { Event } from '../src/types/event';
import type { EventSource } from './event-sources';
import type { ICalEvent } from './ical';

const TOPIC_KEYWORDS: Array<[RegExp, string]> = [
  [/\breact\b/i, 'React'],
  [/\btypescript\b/i, 'TypeScript'],
  [/\bjavascript\b/i, 'JavaScript'],
  [/\bnode(\.js)?\b/i, 'Node'],
  [/\bpython\b/i, 'Python'],
  [/\bgo(lang)?\b/i, 'Go'],
  [/\brust\b/i, 'Rust'],
  [/\b(ai|ml|machine learning|llm|gen ?ai)\b/i, 'AI/ML'],
  [/\b(devops|sre|platform|infrastructure)\b/i, 'DevOps'],
  [/\b(security|infosec)\b/i, 'Security'],
  [/\b(design|ux|ui)\b/i, 'Design'],
  [/\b(product manager|product management|pm)\b/i, 'Product'],
  [/\b(startup|founders?|entrepreneur)\b/i, 'Startup'],
  [/\b(networking|mixer|happy hour|meet & greet)\b/i, 'Networking'],
  [/\b(hackathon|hack night)\b/i, 'Hackathon'],
  [/\b(data|analytics)\b/i, 'Data'],
];

function inferTopics(title: string, description?: string): string[] {
  const haystack = `${title} ${description ?? ''}`;
  const found = new Set<string>();
  for (const [pattern, topic] of TOPIC_KEYWORDS) {
    if (pattern.test(haystack)) found.add(topic);
  }
  return [...found];
}

const ONLINE_RE = /\b(online|virtual|zoom|google meet|teams|webinar|livestream)\b/i;

function detectOnline(location: string | undefined, description: string | undefined): boolean {
  if (location && ONLINE_RE.test(location)) return true;
  if (location && /^https?:\/\//.test(location.trim())) return true;
  if (description && ONLINE_RE.test(description)) return true;
  return false;
}

function stripHtml(s: string): string {
  return s
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + '…';
}

function shorten(s: string): string {
  const firstSentence = s.split(/(?<=[.!?])\s+/)[0] ?? s;
  return truncate(firstSentence, 160);
}

function hashUid(uid: string): string {
  // Deterministic short hash so Firestore doc IDs stay compact and safe.
  let h = 0;
  for (let i = 0; i < uid.length; i++) {
    h = (h * 31 + uid.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(36);
}

export function buildEventId(provider: string, urlname: string, uid: string): string {
  return `${provider}-${urlname}-${hashUid(uid)}`;
}

const NON_UTAH_STATE_RE =
  /,\s*(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|VT|VA|WA|WV|WI|WY)\b/;

function isUtahOrOnline(location: string | undefined, isOnline: boolean): boolean {
  if (isOnline) return true;
  if (!location) return true; // unknown — keep; most groups are Utah-local
  if (/\butah\b|\but\b|,\s*ut\b/i.test(location)) return true;
  // Explicit non-Utah US state → drop
  if (NON_UTAH_STATE_RE.test(location)) return false;
  return true;
}

export interface NormalizeContext {
  now: Date;
}

export function normalizeEvent(
  ical: ICalEvent,
  source: EventSource,
  ctx: NormalizeContext,
): Omit<Event, 'id'> & { id: string } | null {
  if (!ical.start) return null;

  const start = new Date(ical.start);
  if (Number.isNaN(start.getTime())) return null;

  // Drop events that ended more than 24h ago.
  const cutoff = new Date(ctx.now.getTime() - 24 * 60 * 60 * 1000);
  if (start < cutoff) return null;

  const rawDesc = ical.description ? stripHtml(ical.description) : '';
  const description = rawDesc ? truncate(rawDesc, 1200) : `See ${source.name} for details.`;
  const shortDescription = rawDesc ? shorten(rawDesc) : `Hosted by ${source.name}.`;

  const location = ical.location?.trim() || source.defaultLocation;
  const isOnline = detectOnline(ical.location, rawDesc);

  if (!isUtahOrOnline(location, isOnline)) return null;

  const nowIso = ctx.now.toISOString();
  const endIso = ical.end ? new Date(ical.end).toISOString() : undefined;

  return {
    id: buildEventId('meetup', source.urlname, ical.uid),
    title: ical.summary,
    description,
    shortDescription,
    date: new Date(ical.start).toISOString(),
    ...(endIso && !Number.isNaN(new Date(endIso).getTime()) ? { endDate: endIso } : {}),
    location,
    isOnline,
    url: ical.url?.trim() || source.fallbackUrl,
    topics: inferTopics(ical.summary, rawDesc),
    company: source.name,
    isFeatured: false,
    source: 'meetup',
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}
