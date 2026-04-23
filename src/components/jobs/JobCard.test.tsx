import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { JobCard } from './JobCard';
import type { Job } from '../../types/job';

const job: Job = {
  id: 'lucid-frontend',
  title: 'Frontend Engineer',
  company: 'Lucid Software',
  companyId: 'lucid',
  location: 'South Jordan, UT',
  type: 'full-time',
  level: 'mid',
  salary: '$120k–$160k',
  description: 'Build Lucidchart.',
  url: 'https://lucid.example/jobs/frontend',
  topics: ['React', 'TypeScript', 'Frontend', 'Node'],
  postedAt: '2026-04-15T00:00:00Z',
  isHighlighted: true,
  source: 'company',
};

describe('JobCard', () => {
  it('renders title, company, and location', () => {
    render(<JobCard job={job} />);
    expect(screen.getByRole('heading', { name: /frontend engineer/i })).toBeInTheDocument();
    expect(screen.getByText(/Lucid Software · South Jordan, UT/)).toBeInTheDocument();
  });

  it('links to the external job URL in a new tab', () => {
    render(<JobCard job={job} />);
    const link = screen.getByRole('link', { name: /frontend engineer/i });
    expect(link).toHaveAttribute('href', 'https://lucid.example/jobs/frontend');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('renders type, level, and salary badges', () => {
    render(<JobCard job={job} />);
    expect(screen.getByText('Full-time')).toBeInTheDocument();
    expect(screen.getByText('Mid')).toBeInTheDocument();
    expect(screen.getByText('$120k–$160k')).toBeInTheDocument();
  });

  it('caps topic badges in compact variant', () => {
    render(<JobCard job={job} />);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.queryByText('Node')).not.toBeInTheDocument();
  });

  it('omits salary badge when salary is not provided', () => {
    render(<JobCard job={{ ...job, salary: undefined }} />);
    expect(screen.queryByText(/k–/)).not.toBeInTheDocument();
  });
});
