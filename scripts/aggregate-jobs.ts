import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

import type { AtsProvider, Company } from '../src/types/company';
import type { Job, JobLevel, JobType } from '../src/types/job';

const SERVICE_ACCOUNT_PATH =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ?? resolve('.secrets/firebase-admin.json');

const serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const ATS_SOURCES: ReadonlySet<Job['source']> = new Set(['greenhouse', 'lever', 'ashby']);

const UTAH_CITIES = [
  'Salt Lake City',
  'Lehi',
  'Provo',
  'Orem',
  'Draper',
  'South Jordan',
  'West Jordan',
  'Sandy',
  'Lindon',
  'American Fork',
  'Pleasant Grove',
  'Park City',
  'Ogden',
  'Layton',
  'Murray',
  'Midvale',
  'Bluffdale',
  'Cottonwood Heights',
  'Riverton',
  'Herriman',
];

function isUtahLocation(location: string | undefined | null): boolean {
  if (!location) return false;
  const s = location.toLowerCase();
  if (s.includes(', ut') || s.includes('(ut)') || s.includes(' ut ') || s.endsWith(' ut')) return true;
  if (s.includes('utah')) return true;
  return UTAH_CITIES.some((c) => s.includes(c.toLowerCase()));
}

const NON_US_MARKERS =
  /\b(india|canada|mexico|brazil|argentina|colombia|united kingdom|england|scotland|ireland|germany|france|spain|italy|netherlands|poland|ukraine|romania|sweden|norway|denmark|finland|portugal|greece|turkey|israel|uae|dubai|singapore|japan|china|hong kong|taiwan|korea|philippines|indonesia|vietnam|thailand|australia|new zealand|south africa|egypt|nigeria|kenya)\b|,\s*(nl|uk|aus|ind|can|mex|gbr|deu|fra|esp|ita|ire|pol|rou|swe|nor|dnk|fin|prt|isr|are|sgp|jpn|chn|hkg|twn|kor|phl|idn|vnm|tha|aut|nzl|zaf|egy|nga|ken)\b/i;

function isUSCountry(country: string | undefined | null): boolean {
  if (!country) return false;
  const s = country.trim().toLowerCase();
  return s === 'us' || s === 'usa' || s === 'united states' || s === 'united states of america';
}

function mentionsUS(location: string | undefined | null): boolean {
  if (!location) return false;
  const s = location.toLowerCase();
  if (/,\s*us(a)?\b/i.test(location)) return true;
  if (/united states|usa\b/i.test(s)) return true;
  // US state abbreviation anywhere (", XX")
  return /,\s*[A-Z]{2}\b/.test(location);
}

function isRemoteSignal(
  location: string | undefined | null,
  isRemote: boolean | undefined,
  workplaceType: string | undefined | null,
): boolean {
  if (isRemote === true) return true;
  if (workplaceType && /remote/i.test(workplaceType)) return true;
  if (location && /\bremote\b/i.test(location)) return true;
  return false;
}

interface LocationInput {
  location: string | undefined | null;
  country?: string | null;
  isRemote?: boolean;
  workplaceType?: string | null;
}

function shouldIncludeLocation({ location, country, isRemote, workplaceType }: LocationInput): boolean {
  // Hard-reject known-non-US country
  if (country && !isUSCountry(country)) return false;
  if (location && NON_US_MARKERS.test(location)) return false;

  if (isUtahLocation(location)) return true;

  if (isRemoteSignal(location, isRemote, workplaceType)) {
    if (isUSCountry(country)) return true;
    if (mentionsUS(location)) return true;
    // Ambiguous remote (no country hint) → reject to stay honest
    return false;
  }

  return false;
}

const TECH_TITLE_RE =
  /\b(engineer|engineering|developer|programmer|architect|dev[\s-]?ops|sre|reliability|sdet|qa|data scientist|data engineer|data analyst|analytics engineer|ml engineer|ml researcher|ai engineer|ai researcher|ai scientist|machine learning|research scientist|designer|ux|ui designer|technical writer|technical program|technical product|product manager|group pm|security|infosec|software|full[\s-]?stack|front[\s-]?end|back[\s-]?end|ios|android|mobile developer|mobile engineer|platform|infrastructure|cloud engineer|solutions engineer|sales engineer|scientist)\b/i;

const TECH_DEPT_RE =
  /^(engineering|technology|tech\b|design|data\b|research|security|r&d|information technology|it\b|platform|infrastructure|ai\b|ml\b|analytics)/i;

function isTechRole(title: string, department?: string | null): boolean {
  if (TECH_TITLE_RE.test(title)) return true;
  if (department && TECH_DEPT_RE.test(department.trim())) return true;
  return false;
}

const LEVEL_PATTERNS: Array<[RegExp, JobLevel]> = [
  [/\b(intern|internship)\b/i, 'junior'],
  [/\b(junior|jr\.?|entry[- ]level|new grad|associate)\b/i, 'junior'],
  [/\b(staff|principal|distinguished|architect|fellow)\b/i, 'staff'],
  [/\b(senior|sr\.?|lead|manager|director|head of)\b/i, 'senior'],
];

function inferLevel(title: string): JobLevel {
  for (const [pattern, level] of LEVEL_PATTERNS) {
    if (pattern.test(title)) return level;
  }
  return 'mid';
}

function normalizeType(raw: string | undefined | null, title: string): JobType {
  const s = `${raw ?? ''} ${title}`.toLowerCase();
  if (s.includes('intern')) return 'internship';
  if (s.includes('contract')) return 'contract';
  if (s.includes('part') && s.includes('time')) return 'part-time';
  return 'full-time';
}

const TOPIC_KEYWORDS: Array<[RegExp, string]> = [
  [/\breact\b/i, 'React'],
  [/\btypescript\b/i, 'TypeScript'],
  [/\bjavascript\b/i, 'JavaScript'],
  [/\bnode(\.js)?\b/i, 'Node'],
  [/\bpython\b/i, 'Python'],
  [/\bgo(lang)?\b/i, 'Go'],
  [/\bjava\b/i, 'Java'],
  [/\bc#|\.net\b/i, 'C#'],
  [/\bruby\b/i, 'Ruby'],
  [/\brust\b/i, 'Rust'],
  [/\bphp\b/i, 'PHP'],
  [/\bkotlin\b/i, 'Kotlin'],
  [/\bswift\b/i, 'Swift'],
  [/\bios\b/i, 'iOS'],
  [/\bandroid\b/i, 'Android'],
  [/\b(frontend|front[- ]end|ui engineer)\b/i, 'Frontend'],
  [/\b(backend|back[- ]end)\b/i, 'Backend'],
  [/\bfull[- ]stack\b/i, 'Full Stack'],
  [/\b(devops|sre|reliability|platform engineer|infrastructure)\b/i, 'DevOps'],
  [/\b(data engineer|data scientist|analytics|analyst)\b/i, 'Data'],
  [/\b(ai|ml|machine learning|llm|gen ?ai)\b/i, 'AI/ML'],
  [/\b(mobile)\b/i, 'Mobile'],
  [/\b(security)\b/i, 'Security'],
  [/\b(design|ux|ui designer|product designer)\b/i, 'Design'],
  [/\b(product manager|pm\b)/i, 'Product'],
];

function inferTopics(title: string, department?: string | null): string[] {
  const haystack = `${title} ${department ?? ''}`;
  const found = new Set<string>();
  for (const [pattern, topic] of TOPIC_KEYWORDS) {
    if (pattern.test(haystack)) found.add(topic);
  }
  return [...found];
}

function stripHtml(html: string): string {
  return html
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

interface NormalizedJob extends Omit<Job, 'id'> {
  id: string;
}

async function fetchGreenhouse(company: Company): Promise<NormalizedJob[]> {
  const url = `https://boards-api.greenhouse.io/v1/boards/${company.atsSlug}/jobs`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Greenhouse ${company.atsSlug}: ${res.status}`);
  const data = (await res.json()) as {
    jobs: Array<{
      id: number;
      title: string;
      absolute_url: string;
      location: { name: string };
      updated_at: string;
      first_published?: string;
      metadata?: Array<{ name: string; value: string | null }>;
    }>;
  };

  return data.jobs
    .filter((j) => shouldIncludeLocation({ location: j.location?.name }))
    .filter((j) => isTechRole(j.title))
    .map((j) => {
      const employment = j.metadata?.find((m) => /employment/i.test(m.name))?.value ?? undefined;
      return {
        id: `greenhouse-${company.atsSlug}-${j.id}`,
        title: j.title,
        company: company.name,
        companyId: company.id,
        location: j.location.name,
        type: normalizeType(employment ?? undefined, j.title),
        level: inferLevel(j.title),
        description: `See full description at ${company.name}.`,
        url: j.absolute_url,
        topics: inferTopics(j.title),
        postedAt: j.first_published ?? j.updated_at,
        isHighlighted: false,
        source: 'greenhouse' as const,
      };
    });
}

async function fetchAshby(company: Company): Promise<NormalizedJob[]> {
  const url = `https://api.ashbyhq.com/posting-api/job-board/${company.atsSlug}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Ashby ${company.atsSlug}: ${res.status}`);
  const data = (await res.json()) as {
    jobs: Array<{
      id: string;
      title: string;
      department?: string;
      team?: string;
      employmentType?: string;
      location?: string;
      publishedAt: string;
      jobUrl: string;
      descriptionHtml?: string;
      isRemote?: boolean;
      workplaceType?: string;
      address?: { postalAddress?: { addressCountry?: string } };
    }>;
  };

  return data.jobs
    .filter((j) =>
      shouldIncludeLocation({
        location: j.location,
        country: j.address?.postalAddress?.addressCountry,
        isRemote: j.isRemote,
        workplaceType: j.workplaceType,
      }),
    )
    .filter((j) => isTechRole(j.title, j.department ?? j.team))
    .map((j) => {
      const description = j.descriptionHtml
        ? truncate(stripHtml(j.descriptionHtml), 400)
        : `See full description at ${company.name}.`;
      return {
        id: `ashby-${company.atsSlug}-${j.id}`,
        title: j.title,
        company: company.name,
        companyId: company.id,
        location: j.location ?? 'Utah',
        type: normalizeType(j.employmentType, j.title),
        level: inferLevel(j.title),
        description,
        url: j.jobUrl,
        topics: inferTopics(j.title, j.department ?? j.team),
        postedAt: j.publishedAt,
        isHighlighted: false,
        source: 'ashby' as const,
      };
    });
}

async function fetchLever(company: Company): Promise<NormalizedJob[]> {
  const url = `https://api.lever.co/v0/postings/${company.atsSlug}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Lever ${company.atsSlug}: ${res.status}`);
  const data = (await res.json()) as Array<{
    id: string;
    text: string;
    hostedUrl: string;
    createdAt: number;
    country?: string;
    workplaceType?: string;
    categories?: {
      location?: string;
      team?: string;
      department?: string;
      commitment?: string;
    };
    descriptionPlain?: string;
  }>;

  return data
    .filter((j) =>
      shouldIncludeLocation({
        location: j.categories?.location,
        country: j.country,
        workplaceType: j.workplaceType,
      }),
    )
    .filter((j) => isTechRole(j.text, j.categories?.team ?? j.categories?.department))
    .map((j) => ({
      id: `lever-${company.atsSlug}-${j.id}`,
      title: j.text,
      company: company.name,
      companyId: company.id,
      location: j.categories?.location ?? 'Utah',
      type: normalizeType(j.categories?.commitment, j.text),
      level: inferLevel(j.text),
      description: j.descriptionPlain
        ? truncate(j.descriptionPlain, 400)
        : `See full description at ${company.name}.`,
      url: j.hostedUrl,
      topics: inferTopics(j.text, j.categories?.team ?? j.categories?.department),
      postedAt: new Date(j.createdAt).toISOString(),
      isHighlighted: false,
      source: 'lever' as const,
    }));
}

const FETCHERS: Record<AtsProvider, (c: Company) => Promise<NormalizedJob[]>> = {
  greenhouse: fetchGreenhouse,
  ashby: fetchAshby,
  lever: fetchLever,
};

async function loadCompaniesWithAts(): Promise<Company[]> {
  const snap = await db.collection('companies').get();
  const companies: Company[] = [];
  for (const doc of snap.docs) {
    const data = doc.data() as Omit<Company, 'id'>;
    if (data.ats && data.atsSlug) {
      companies.push({ ...data, id: doc.id });
    }
  }
  return companies;
}

async function deleteExistingAtsJobs(): Promise<number> {
  const snap = await db
    .collection('jobs')
    .where('source', 'in', [...ATS_SOURCES])
    .get();
  if (snap.empty) return 0;
  const batch = db.batch();
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  return snap.size;
}

async function writeJobs(jobs: NormalizedJob[]): Promise<void> {
  if (jobs.length === 0) return;
  const batch = db.batch();
  for (const job of jobs) {
    const { id, ...data } = job;
    batch.set(db.collection('jobs').doc(id), data);
  }
  await batch.commit();
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run');

  console.log('Loading companies with ATS config...');
  const companies = await loadCompaniesWithAts();
  console.log(`  found ${companies.length} companies with ATS\n`);

  const allJobs: NormalizedJob[] = [];
  const errors: Array<{ company: string; error: string }> = [];

  for (const company of companies) {
    const fetcher = FETCHERS[company.ats!];
    try {
      const jobs = await fetcher(company);
      console.log(`  ${company.name} (${company.ats}/${company.atsSlug}): ${jobs.length} Utah jobs`);
      allJobs.push(...jobs);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ ${company.name}: ${msg}`);
      errors.push({ company: company.name, error: msg });
    }
  }

  console.log(`\nTotal: ${allJobs.length} jobs from ${companies.length - errors.length}/${companies.length} sources`);

  if (dryRun) {
    console.log('\n--dry-run: no Firestore writes. All jobs:');
    for (const j of allJobs) {
      console.log(`  - [${j.source}] ${j.title} · ${j.company} · ${j.location} · ${j.level}`);
    }
    process.exit(0);
  }

  console.log('\nDeleting existing ATS-sourced jobs...');
  const deleted = await deleteExistingAtsJobs();
  console.log(`  deleted ${deleted}`);

  console.log(`Writing ${allJobs.length} fresh jobs...`);
  await writeJobs(allJobs);
  console.log('  ✓ done');

  if (errors.length > 0) {
    console.error(`\n${errors.length} source(s) failed — run was partial.`);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Aggregation failed:', err);
    process.exit(1);
  });
