export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship';
export type JobLevel = 'junior' | 'mid' | 'senior' | 'staff' | 'any';

export interface Job {
  id: string;
  title: string;
  company: string;
  companyId?: string;
  location: string;
  type: JobType;
  level: JobLevel;
  salary?: string;
  description: string;
  url: string;
  topics: string[];
  postedAt: string;
  expiresAt?: string;
  isHighlighted: boolean;
  source: 'linkedin' | 'indeed' | 'manual' | 'company' | 'greenhouse' | 'lever' | 'ashby';
}
