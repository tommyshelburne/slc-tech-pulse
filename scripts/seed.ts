import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

import type { Company } from '../src/types/company';
import type { Event } from '../src/types/event';
import type { Job } from '../src/types/job';

const SERVICE_ACCOUNT_PATH =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ?? resolve('.secrets/firebase-admin.json');

const serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const companies: Company[] = [
  {
    id: 'lucid',
    name: 'Lucid Software',
    description:
      'Visual collaboration platform behind Lucidchart and Lucidspark. Helps teams diagram architecture, map processes, and whiteboard remotely.',
    website: 'https://www.lucidsoftware.com',
    location: 'South Jordan, UT',
    size: 'large',
    topics: ['React', 'TypeScript', 'Go', 'AWS'],
    careersUrl: 'https://www.lucidsoftware.com/careers',
    isHiring: true,
    isFeatured: true,
    ats: 'greenhouse',
    atsSlug: 'lucidsoftware',
  },
  {
    id: 'bamboohr',
    name: 'BambooHR',
    description:
      'HR software for small and mid-sized businesses. Payroll, hiring, onboarding, and employee data in one platform.',
    website: 'https://www.bamboohr.com',
    location: 'Lindon, UT',
    size: 'large',
    topics: ['Ember', 'React', 'PHP', 'Node'],
    careersUrl: 'https://www.bamboohr.com/about/careers/',
    isHiring: true,
    isFeatured: false,
  },
  {
    id: 'adobe-lehi',
    name: 'Adobe (Lehi Campus)',
    description:
      "Adobe's Lehi campus — Creative Cloud, Digital Experience, and Workfront teams. One of the largest tech employers in Silicon Slopes.",
    website: 'https://www.adobe.com',
    location: 'Lehi, UT',
    size: 'enterprise',
    topics: ['React', 'TypeScript', 'Java', 'AI/ML'],
    careersUrl: 'https://www.adobe.com/careers.html',
    isHiring: true,
    isFeatured: true,
  },
  {
    id: 'domo',
    name: 'Domo',
    description:
      'Cloud-native BI platform. Dashboards, data apps, and real-time analytics for business users.',
    website: 'https://www.domo.com',
    location: 'American Fork, UT',
    size: 'large',
    topics: ['React', 'Java', 'GCP', 'Data Viz'],
    careersUrl: 'https://www.domo.com/company/careers',
    isHiring: true,
    isFeatured: false,
  },
  {
    id: 'podium',
    name: 'Podium',
    description:
      'AI-powered messaging platform that helps local businesses capture leads, reviews, and payments.',
    website: 'https://www.podium.com',
    location: 'Lehi, UT',
    size: 'large',
    topics: ['React', 'TypeScript', 'Ruby', 'AI/ML'],
    careersUrl: 'https://www.podium.com/careers',
    isHiring: true,
    isFeatured: true,
    ats: 'ashby',
    atsSlug: 'podium',
  },
  {
    id: 'qualtrics',
    name: 'Qualtrics',
    description:
      'Experience management platform — surveys, customer experience, employee experience, and product research.',
    website: 'https://www.qualtrics.com',
    location: 'Provo, UT',
    size: 'enterprise',
    topics: ['React', 'Java', 'Python', 'Analytics'],
    careersUrl: 'https://www.qualtrics.com/careers',
    isHiring: true,
    isFeatured: false,
    ats: 'greenhouse',
    atsSlug: 'qualtrics',
  },
  {
    id: 'weave',
    name: 'Weave',
    description:
      'Customer communication platform for healthcare offices. Phone, text, reviews, and payments in one place.',
    website: 'https://www.getweave.com',
    location: 'Lehi, UT',
    size: 'large',
    topics: ['React', 'TypeScript', 'Go', 'GCP'],
    careersUrl: 'https://www.getweave.com/careers',
    isHiring: true,
    isFeatured: false,
    ats: 'ashby',
    atsSlug: 'weave',
  },
  {
    id: 'entrata',
    name: 'Entrata',
    description:
      'Property management software for the multi-family housing industry — leasing, payments, maintenance, and resident services.',
    website: 'https://www.entrata.com',
    location: 'Lehi, UT',
    size: 'large',
    topics: ['React', 'PHP', 'AWS'],
    careersUrl: 'https://www.entrata.com/careers',
    isHiring: true,
    isFeatured: false,
    ats: 'lever',
    atsSlug: 'entrata',
  },
  {
    id: 'divvy',
    name: 'BILL Spend & Expense (Divvy)',
    description:
      'Expense management and corporate cards, acquired by BILL. Finance automation for growing companies.',
    website: 'https://www.bill.com/product/spend-and-expense',
    location: 'Draper, UT',
    size: 'large',
    topics: ['React', 'TypeScript', 'Node', 'Fintech'],
    careersUrl: 'https://www.bill.com/careers',
    isHiring: true,
    isFeatured: false,
  },
  {
    id: 'mx',
    name: 'MX Technologies',
    description:
      'Financial data platform powering thousands of banks, credit unions, and fintechs. Open banking and money experience APIs.',
    website: 'https://www.mx.com',
    location: 'Lehi, UT',
    size: 'mid',
    topics: ['React', 'TypeScript', 'Go', 'Fintech'],
    careersUrl: 'https://www.mx.com/careers',
    isHiring: true,
    isFeatured: false,
  },
  {
    id: 'health-catalyst',
    name: 'Health Catalyst',
    description:
      'Healthcare data and analytics platform — clinical outcomes, financial performance, and population health.',
    website: 'https://www.healthcatalyst.com',
    location: 'South Jordan, UT',
    size: 'large',
    topics: ['React', 'C#', 'SQL', 'Healthcare'],
    careersUrl: 'https://www.healthcatalyst.com/careers',
    isHiring: true,
    isFeatured: false,
  },
  {
    id: 'canopy',
    name: 'Canopy',
    description:
      'Practice management software for accounting firms — client management, document management, workflow, and tax resolution.',
    website: 'https://www.getcanopy.com',
    location: 'Lehi, UT',
    size: 'mid',
    topics: ['React', 'TypeScript', 'Node'],
    careersUrl: 'https://www.getcanopy.com/careers',
    isHiring: true,
    isFeatured: false,
    ats: 'ashby',
    atsSlug: 'canopy',
  },
  {
    id: 'recursion',
    name: 'Recursion Pharmaceuticals',
    description:
      'TechBio company decoding biology with industrial-scale machine learning to discover novel medicines. SLC headquarters with a wet lab and ML platform team.',
    website: 'https://www.recursion.com',
    location: 'Salt Lake City, UT',
    size: 'large',
    topics: ['Python', 'AI/ML', 'Data', 'AWS'],
    careersUrl: 'https://www.recursion.com/careers',
    isHiring: true,
    isFeatured: true,
    ats: 'greenhouse',
    atsSlug: 'recursionpharmaceuticals',
  },
  {
    id: 'route',
    name: 'Route',
    description:
      'Post-purchase platform for online merchants — package tracking, shipping protection, and a branded order experience powering thousands of Shopify stores.',
    website: 'https://route.com',
    location: 'Lehi, UT',
    size: 'mid',
    topics: ['React', 'TypeScript', 'Node', 'Ecommerce'],
    careersUrl: 'https://route.com/careers',
    isHiring: true,
    isFeatured: false,
    ats: 'greenhouse',
    atsSlug: 'route',
  },
  {
    id: 'pattern',
    name: 'Pattern',
    description:
      'Global ecommerce accelerator helping brands grow on Amazon, Walmart, and other marketplaces. Combines data science, advertising, and logistics across 60+ countries.',
    website: 'https://pattern.com',
    location: 'Lehi, UT',
    size: 'large',
    topics: ['React', 'TypeScript', 'Python', 'Ecommerce'],
    careersUrl: 'https://pattern.com/careers',
    isHiring: true,
    isFeatured: false,
    ats: 'lever',
    atsSlug: 'pattern',
  },
  {
    id: 'filevine',
    name: 'Filevine',
    description:
      'Legal-work platform for case management, document automation, and matter analytics. Used by law firms across the country to run their practice end-to-end.',
    website: 'https://www.filevine.com',
    location: 'Salt Lake City, UT',
    size: 'large',
    topics: ['React', 'TypeScript', 'Node', 'Legal'],
    careersUrl: 'https://www.filevine.com/careers/',
    isHiring: true,
    isFeatured: false,
    ats: 'lever',
    atsSlug: 'filevine',
  },
  {
    id: 'awardco',
    name: 'Awardco',
    description:
      'Employee recognition and rewards platform with the largest reward network of any platform in its category. Backed by an Amazon Business partnership.',
    website: 'https://www.awardco.com',
    location: 'Lindon, UT',
    size: 'mid',
    topics: ['React', 'TypeScript', 'Node'],
    careersUrl: 'https://www.awardco.com/careers',
    isHiring: true,
    isFeatured: false,
    ats: 'greenhouse',
    atsSlug: 'awardco',
  },
  {
    id: 'pluralsight',
    name: 'Pluralsight',
    description:
      'Tech workforce-development platform — courses, hands-on labs, and skills assessments used by individual engineers and Fortune 500 enterprises.',
    website: 'https://www.pluralsight.com',
    location: 'Draper, UT',
    size: 'large',
    topics: ['React', 'TypeScript', 'Go', 'Education'],
    careersUrl: 'https://www.pluralsight.com/careers',
    isHiring: true,
    isFeatured: false,
  },
  {
    id: 'vasion',
    name: 'Vasion',
    description:
      'Print-and-document automation platform (formerly PrinterLogic). SaaS for serverless printing, content services, and workflow automation.',
    website: 'https://www.vasion.com',
    location: 'St. George, UT',
    size: 'mid',
    topics: ['Vue', 'Node', 'AWS'],
    careersUrl: 'https://www.vasion.com/careers/',
    isHiring: true,
    isFeatured: false,
  },
  {
    id: 'nav',
    name: 'Nav Technologies',
    description:
      'Small-business financial-health platform — credit, lending, and cash-flow tools for SMB owners. Mix of ML-driven product and fintech services.',
    website: 'https://www.nav.com',
    location: 'Draper, UT',
    size: 'mid',
    topics: ['React', 'Python', 'Fintech'],
    careersUrl: 'https://www.nav.com/about/careers/',
    isHiring: true,
    isFeatured: false,
  },
  {
    id: 'vivint',
    name: 'Vivint Smart Home',
    description:
      'Smart-home and security platform combining hardware, mobile, and cloud services. Engineering teams across mobile, web, IoT firmware, and machine learning.',
    website: 'https://www.vivint.com',
    location: 'Provo, UT',
    size: 'large',
    topics: ['React', 'TypeScript', 'Node', 'IoT'],
    careersUrl: 'https://careers.vivint.com',
    isHiring: true,
    isFeatured: false,
  },
];

// Events are not seeded — they are populated by `npm run aggregate:events`,
// which pulls upcoming events from the configured Meetup groups via the
// Meetup GraphQL API. Set MEETUP_* secrets (see docs/meetup-setup.md) to
// enable. Until then, the Events page directs visitors upstream.
const events: Event[] = [];


// Jobs are not seeded — they are populated by `npm run aggregate:jobs`,
// which pulls live postings from each company's public ATS feed
// (Greenhouse, Lever, Ashby). This keeps the listings real and current.
const jobs: Job[] = [];

async function deleteCollection(name: string): Promise<number> {
  const snap = await db.collection(name).get();
  if (snap.empty) return 0;
  // batched commits — Firestore caps at 500 ops/batch.
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

async function seedCollection<T extends { id: string }>(
  name: string,
  items: T[],
): Promise<void> {
  const deleted = await deleteCollection(name);
  console.log(`Seeding ${items.length} ${name} (cleared ${deleted})...`);
  if (items.length === 0) {
    console.log(`  ✓ ${name} (empty — populated elsewhere)`);
    return;
  }
  const batch = db.batch();
  for (const item of items) {
    const { id, ...data } = item;
    batch.set(db.collection(name).doc(id), data);
  }
  await batch.commit();
  console.log(`  ✓ ${name}`);
}

async function main(): Promise<void> {
  await seedCollection('companies', companies);
  await seedCollection('events', events);
  await seedCollection('jobs', jobs);
  console.log('\nSeed complete.');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
