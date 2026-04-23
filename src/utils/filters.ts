import type { Event } from '../types/event';
import type { Job } from '../types/job';
import type { Company } from '../types/company';
import type {
  CompanySizeFilter,
  EventDateFilter,
  EventFormatFilter,
  JobLevelFilter,
  JobLocationFilter,
  JobTypeFilter,
} from '../store/uiStore';
import { isThisMonth, isThisWeek, isNextMonth } from './dates';

export type { CompanySizeFilter } from '../store/uiStore';

interface EventFilters {
  topics: string[];
  date: EventDateFilter;
  format: EventFormatFilter;
  query: string;
}

export function filterEvents(
  events: Event[],
  filters: EventFilters,
  now: Date = new Date(),
): Event[] {
  const normalizedQuery = filters.query.trim().toLowerCase();

  return events.filter((event) => {
    if (filters.topics.length > 0) {
      const hasAny = filters.topics.some((topic) => event.topics.includes(topic));
      if (!hasAny) return false;
    }

    if (filters.format === 'online' && !event.isOnline) return false;
    if (filters.format === 'in-person' && event.isOnline) return false;

    if (filters.date === 'week' && !isThisWeek(event.date, now)) return false;
    if (filters.date === 'month' && !isThisMonth(event.date, now)) return false;
    if (filters.date === 'next-month' && !isNextMonth(event.date, now)) return false;

    if (normalizedQuery.length > 0) {
      const haystack = `${event.title} ${event.description} ${event.shortDescription}`.toLowerCase();
      if (!haystack.includes(normalizedQuery)) return false;
    }

    return true;
  });
}

export const EVENT_TOPIC_OPTIONS = [
  'React',
  'TypeScript',
  'AI/ML',
  'Networking',
  'Startup',
  'Backend',
  'DevOps',
  'Design',
  'Product',
] as const;

export const EVENT_DATE_OPTIONS: { value: EventDateFilter; label: string }[] = [
  { value: 'all', label: 'All dates' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
  { value: 'next-month', label: 'Next month' },
];

export const EVENT_FORMAT_OPTIONS: { value: EventFormatFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'in-person', label: 'In-person' },
  { value: 'online', label: 'Online' },
];

interface JobFilters {
  type: JobTypeFilter;
  level: JobLevelFilter;
  location: JobLocationFilter;
  topics: string[];
  query: string;
}

function matchesJobLocation(location: string, filter: JobLocationFilter): boolean {
  if (filter === 'all') return true;
  const lower = location.toLowerCase();
  if (filter === 'remote') return lower.includes('remote');
  if (filter === 'hybrid') return lower.includes('hybrid');
  // on-site: not remote and not hybrid
  return !lower.includes('remote') && !lower.includes('hybrid');
}

export function filterJobs(jobs: Job[], filters: JobFilters): Job[] {
  const normalizedQuery = filters.query.trim().toLowerCase();

  return jobs.filter((job) => {
    if (filters.type !== 'all' && job.type !== filters.type) return false;
    if (filters.level !== 'all' && job.level !== filters.level) return false;
    if (!matchesJobLocation(job.location, filters.location)) return false;

    if (filters.topics.length > 0) {
      const hasAny = filters.topics.some((topic) => job.topics.includes(topic));
      if (!hasAny) return false;
    }

    if (normalizedQuery.length > 0) {
      const haystack = `${job.title} ${job.company}`.toLowerCase();
      if (!haystack.includes(normalizedQuery)) return false;
    }

    return true;
  });
}

export const JOB_TYPE_OPTIONS: { value: JobTypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
];

export const JOB_LEVEL_OPTIONS: { value: JobLevelFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid' },
  { value: 'senior', label: 'Senior' },
  { value: 'staff', label: 'Staff' },
];

export const JOB_LOCATION_OPTIONS: { value: JobLocationFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'on-site', label: 'On-site' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
];

export const JOB_TOPIC_OPTIONS = [
  'React',
  'TypeScript',
  'Node',
  'Go',
  'Python',
  'Java',
  'C#',
  'Frontend',
  'Backend',
  'AI/ML',
  'Fintech',
  'Healthcare',
] as const;

interface CompanyFilters {
  hiring: boolean;
  size: CompanySizeFilter;
  topics: string[];
  query: string;
}

export function filterCompanies(companies: Company[], filters: CompanyFilters): Company[] {
  const normalizedQuery = filters.query.trim().toLowerCase();

  return companies.filter((company) => {
    if (filters.hiring && !company.isHiring) return false;
    if (filters.size !== 'all' && company.size !== filters.size) return false;

    if (filters.topics.length > 0) {
      const hasAny = filters.topics.some((topic) => company.topics.includes(topic));
      if (!hasAny) return false;
    }

    if (normalizedQuery.length > 0) {
      const haystack = `${company.name} ${company.description}`.toLowerCase();
      if (!haystack.includes(normalizedQuery)) return false;
    }

    return true;
  });
}

export const COMPANY_SIZE_OPTIONS: { value: CompanySizeFilter; label: string }[] = [
  { value: 'all', label: 'Any size' },
  { value: 'startup', label: 'Startup' },
  { value: 'small', label: 'Small' },
  { value: 'mid', label: 'Mid' },
  { value: 'large', label: 'Large' },
  { value: 'enterprise', label: 'Enterprise' },
];

export const COMPANY_TOPIC_OPTIONS = [
  'React',
  'TypeScript',
  'Node',
  'Go',
  'Python',
  'Java',
  'C#',
  'AI/ML',
  'Fintech',
  'Healthcare',
  'AWS',
  'GCP',
] as const;
