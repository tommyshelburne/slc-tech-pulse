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

const NOW = new Date().toISOString();

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
];

const events: Event[] = [
  {
    id: 'silicon-slopes-summit-2026-afterparty',
    title: 'Silicon Slopes Summit 2026 Afterparty',
    shortDescription:
      'Wrap the summit with live music, food trucks, and unstructured networking at the Adobe amphitheater.',
    description:
      "The official Silicon Slopes Summit afterparty. Music, food trucks, and unstructured networking with the broader Utah tech community. Bring your badge — summit attendees get priority entry, but the event is open to all.",
    date: '2026-05-02T19:00:00-06:00',
    endDate: '2026-05-02T23:00:00-06:00',
    location: 'Lehi, UT',
    venue: 'Adobe Lehi Amphitheater',
    isOnline: false,
    url: 'https://siliconslopes.com/',
    topics: ['Networking', 'Startup'],
    company: 'adobe-lehi',
    isFeatured: true,
    source: 'manual',
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'react-slc-may-2026',
    title: 'React SLC · May Meetup',
    shortDescription: 'Lightning talks on React Server Components and the new use() hook, plus pizza.',
    description:
      'Monthly React SLC meetup. This month: two lightning talks — "Shipping React 19 in production" and "Suspense-first data fetching patterns." Doors at 6pm, talks at 6:30. Pizza sponsored by Lucid.',
    date: '2026-05-15T18:00:00-06:00',
    endDate: '2026-05-15T20:30:00-06:00',
    location: 'Salt Lake City, UT',
    venue: 'Impact Hub SLC',
    isOnline: false,
    url: 'https://www.meetup.com/',
    topics: ['React', 'TypeScript', 'Frontend'],
    isFeatured: true,
    source: 'meetup',
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'utah-aiml-meetup-may-2026',
    title: 'Utah AI/ML Meetup · Agentic Systems in Production',
    shortDescription:
      'Three talks on running agentic LLM systems in production — reliability, cost, and evals.',
    description:
      'Speakers from Podium, Domo, and a stealth AI startup share how they ship agentic systems to real customers. Includes live Q&A and post-talk networking.',
    date: '2026-05-22T18:30:00-06:00',
    location: 'Lehi, UT',
    venue: 'Podium HQ',
    isOnline: false,
    url: 'https://www.meetup.com/',
    topics: ['AI/ML', 'Backend'],
    company: 'podium',
    isFeatured: true,
    source: 'meetup',
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'lehi-tech-happy-hour-may-2026',
    title: 'Lehi Tech Happy Hour',
    shortDescription:
      'Casual networking for engineers, PMs, and founders across the Silicon Slopes corridor.',
    description:
      'No agenda, no talks. Just drinks, food, and a chance to put faces to names. Come early — the good tables go fast.',
    date: '2026-05-08T17:30:00-06:00',
    endDate: '2026-05-08T19:30:00-06:00',
    location: 'Lehi, UT',
    venue: 'The Hub at Traverse Mountain',
    isOnline: false,
    url: 'https://lu.ma/',
    topics: ['Networking'],
    isFeatured: false,
    source: 'manual',
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'adobe-genai-creative-suite-2026',
    title: 'Adobe Tech Talk · GenAI in Creative Suite',
    shortDescription:
      'Inside look at how Adobe ships generative AI features in Photoshop and Premiere at scale.',
    description:
      "Adobe engineers walk through the architecture behind Firefly's integration into Creative Cloud — model serving, latency budgets, and user experience tradeoffs. Q&A to follow.",
    date: '2026-05-20T17:00:00-06:00',
    location: 'Lehi, UT',
    venue: 'Adobe Lehi Building A',
    isOnline: false,
    url: 'https://www.adobe.com/events.html',
    topics: ['AI/ML', 'Design', 'Backend'],
    company: 'adobe-lehi',
    isFeatured: false,
    source: 'company',
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'lucid-hackathon-2026',
    title: 'Lucid Hackathon 2026',
    shortDescription:
      '24-hour hackathon at Lucid HQ. Build something on top of Lucid APIs — prizes for best design tool, best AI integration, and best wildcard.',
    description:
      "Lucid's annual open hackathon. Teams of up to 4. Lucid will provide food, drinks, and API credits. All skill levels welcome. Bring a laptop and an idea.",
    date: '2026-06-13T09:00:00-06:00',
    endDate: '2026-06-14T09:00:00-06:00',
    location: 'South Jordan, UT',
    venue: 'Lucid HQ',
    isOnline: false,
    url: 'https://www.lucidsoftware.com/',
    topics: ['React', 'AI/ML', 'Design', 'Startup'],
    company: 'lucid',
    isFeatured: true,
    source: 'company',
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'bamboohr-engineering-open-house-2026',
    title: 'BambooHR Engineering Open House',
    shortDescription: 'Meet the BambooHR engineering team, tour the office, and learn how they ship.',
    description:
      "Informal evening with BambooHR engineers. Office tour, short tech talk on their migration from Ember to React, and 1:1 time with team leads. Open bar and appetizers.",
    date: '2026-06-05T17:30:00-06:00',
    location: 'Lindon, UT',
    venue: 'BambooHR HQ',
    isOnline: false,
    url: 'https://www.bamboohr.com/',
    topics: ['React', 'Frontend', 'Networking'],
    company: 'bamboohr',
    isFeatured: false,
    source: 'company',
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'domo-developer-day-2026',
    title: 'Domo Developer Day',
    shortDescription:
      'Full-day technical conference on the Domo platform — API integrations, data apps, and custom visualizations.',
    description:
      "Deep-dive technical sessions for developers building on Domo. Topics include Domo's low-code app builder, custom D3 bricks, and the upcoming Everywhere SDK. Includes lunch.",
    date: '2026-06-18T09:00:00-06:00',
    endDate: '2026-06-18T17:00:00-06:00',
    location: 'American Fork, UT',
    venue: 'Domo HQ',
    isOnline: false,
    url: 'https://www.domo.com/',
    topics: ['Backend', 'Data Viz', 'Product'],
    company: 'domo',
    isFeatured: false,
    source: 'company',
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'women-in-tech-utah-may-2026-mixer',
    title: 'Women in Tech Utah · May Mixer',
    shortDescription:
      'Monthly networking mixer for women and non-binary folks in Utah tech, hosted at Canopy.',
    description:
      'Drinks, appetizers, and unstructured networking. New attendees welcome. Canopy is providing the space and refreshments — RSVP via the link.',
    date: '2026-05-29T17:30:00-06:00',
    endDate: '2026-05-29T19:30:00-06:00',
    location: 'Lehi, UT',
    venue: 'Canopy HQ',
    isOnline: false,
    url: 'https://lu.ma/',
    topics: ['Networking'],
    company: 'canopy',
    isFeatured: false,
    source: 'manual',
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'yc-utah-alumni-mixer-2026',
    title: 'Y Combinator Utah Alumni Mixer',
    shortDescription:
      'Invite-open mixer for YC alumni and founders currently fundraising. Drinks and intros.',
    description:
      'YC alumni in Utah and anyone currently building. Low-key evening at a founder-friendly rooftop bar. Expect founders, angels, and a few curious engineers.',
    date: '2026-06-25T18:00:00-06:00',
    location: 'Salt Lake City, UT',
    venue: 'Kimpton Hotel Monaco Rooftop',
    isOnline: false,
    url: 'https://lu.ma/',
    topics: ['Networking', 'Startup'],
    isFeatured: false,
    source: 'manual',
    createdAt: NOW,
    updatedAt: NOW,
  },
];

const jobs: Job[] = [
  {
    id: 'bamboohr-full-stack-developer',
    title: 'Full Stack Developer',
    company: 'BambooHR',
    companyId: 'bamboohr',
    location: 'Lindon, UT',
    type: 'full-time',
    level: 'mid',
    salary: '$110k–$140k',
    description:
      'Build customer-facing features across the BambooHR platform. React on the frontend, PHP + Node services on the backend. Product-minded engineers encouraged to apply.',
    url: 'https://www.bamboohr.com/about/careers/',
    topics: ['React', 'PHP', 'Node'],
    postedAt: '2026-04-12T00:00:00Z',
    isHighlighted: false,
    source: 'company',
  },
  {
    id: 'adobe-swe-ii-creative-cloud',
    title: 'Software Engineer II · Creative Cloud',
    company: 'Adobe',
    companyId: 'adobe-lehi',
    location: 'Lehi, UT',
    type: 'full-time',
    level: 'mid',
    salary: '$130k–$170k',
    description:
      "Work on the Creative Cloud web surfaces — billing, account, and creative asset management. React + TypeScript with some Java services. Hybrid 3 days in office.",
    url: 'https://www.adobe.com/careers.html',
    topics: ['React', 'TypeScript', 'Java'],
    postedAt: '2026-04-15T00:00:00Z',
    isHighlighted: false,
    source: 'company',
  },
  {
    id: 'domo-react-developer',
    title: 'React Developer',
    company: 'Domo',
    companyId: 'domo',
    location: 'American Fork, UT',
    type: 'full-time',
    level: 'mid',
    description:
      "Build the next generation of Domo's dashboard experience. Heavy React + TypeScript work, some D3, real-time data streams.",
    url: 'https://www.domo.com/company/careers',
    topics: ['React', 'TypeScript', 'Data Viz'],
    postedAt: '2026-04-08T00:00:00Z',
    isHighlighted: false,
    source: 'linkedin',
  },
  {
    id: 'divvy-swe-ii',
    title: 'Software Engineer II',
    company: 'BILL Spend & Expense',
    companyId: 'divvy',
    location: 'Draper, UT',
    type: 'full-time',
    level: 'mid',
    description:
      'Work on expense management core — transaction processing, card controls, and reporting. React + TypeScript on the frontend, Node on the backend.',
    url: 'https://www.bill.com/careers',
    topics: ['React', 'TypeScript', 'Node'],
    postedAt: '2026-04-09T00:00:00Z',
    isHighlighted: false,
    source: 'linkedin',
  },
  {
    id: 'mx-junior-frontend',
    title: 'Junior Frontend Engineer',
    company: 'MX Technologies',
    companyId: 'mx',
    location: 'Lehi, UT',
    type: 'full-time',
    level: 'junior',
    salary: '$80k–$100k',
    description:
      "Frontend role on MX's core web app used by banks and credit unions. React + TypeScript. Strong mentorship, clear growth path.",
    url: 'https://www.mx.com/careers/',
    topics: ['React', 'TypeScript', 'Fintech'],
    postedAt: '2026-04-11T00:00:00Z',
    isHighlighted: false,
    source: 'company',
  },
  {
    id: 'health-catalyst-software-engineer',
    title: 'Software Engineer · Analytics Platform',
    company: 'Health Catalyst',
    companyId: 'health-catalyst',
    location: 'South Jordan, UT',
    type: 'full-time',
    level: 'mid',
    description:
      "Build the web tools clinicians and analysts use to surface insights from healthcare data. C# on the backend, React on the frontend.",
    url: 'https://www.healthcatalyst.com/careers/',
    topics: ['React', 'C#', 'Healthcare'],
    postedAt: '2026-04-06T00:00:00Z',
    isHighlighted: false,
    source: 'company',
  },
  {
    id: 'vivint-react-node-developer',
    title: 'React / Node Developer',
    company: 'Vivint Smart Home',
    location: 'Provo, UT',
    type: 'full-time',
    level: 'mid',
    salary: '$115k–$145k',
    description:
      "Ship customer-facing features in the Vivint web and mobile app. Heavy React + TypeScript, Node services, some React Native cross-over.",
    url: 'https://careers.vivint.com/',
    topics: ['React', 'TypeScript', 'Node'],
    postedAt: '2026-04-13T00:00:00Z',
    isHighlighted: false,
    source: 'linkedin',
  },
  {
    id: 'adobe-workfront-swe',
    title: 'Software Engineer · Workfront',
    company: 'Adobe (Workfront)',
    companyId: 'adobe-lehi',
    location: 'Lehi, UT',
    type: 'full-time',
    level: 'senior',
    salary: '$160k–$210k',
    description:
      "Senior engineer role on the Workfront platform. React + TypeScript frontend, Java services, large-scale enterprise customers.",
    url: 'https://www.adobe.com/careers.html',
    topics: ['React', 'TypeScript', 'Java'],
    postedAt: '2026-04-16T00:00:00Z',
    isHighlighted: false,
    source: 'company',
  },
  {
    id: 'claimlogiq-junior-swe',
    title: 'Junior Software Engineer',
    company: 'ClaimLogiq',
    location: 'Lehi, UT',
    type: 'full-time',
    level: 'junior',
    salary: '$78k–$95k',
    description:
      "Entry role at a healthcare payments startup. React + TypeScript frontend, .NET backend. Small team, high leverage.",
    url: 'https://claimlogiq.com/careers/',
    topics: ['React', 'TypeScript', 'C#', 'Healthcare'],
    postedAt: '2026-04-07T00:00:00Z',
    isHighlighted: false,
    source: 'company',
  },
];

async function seedCollection<T extends { id: string }>(
  name: string,
  items: T[],
): Promise<void> {
  console.log(`Seeding ${items.length} ${name}...`);
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
