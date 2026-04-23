import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CompanyCard } from './CompanyCard';
import type { Company } from '../../types/company';

const company: Company = {
  id: 'lucid',
  name: 'Lucid Software',
  description: 'Visual collaboration platform behind Lucidchart.',
  website: 'https://www.lucidsoftware.com',
  location: 'South Jordan, UT',
  size: 'large',
  topics: ['React', 'TypeScript', 'Go', 'AWS'],
  isHiring: true,
  isFeatured: true,
};

describe('CompanyCard', () => {
  it('renders name, size, location, and description', () => {
    render(<CompanyCard company={company} />);
    expect(screen.getByRole('heading', { name: /lucid software/i })).toBeInTheDocument();
    expect(screen.getByText(/Large · South Jordan, UT/)).toBeInTheDocument();
    expect(screen.getByText(/Visual collaboration platform/)).toBeInTheDocument();
  });

  it('links to the company website in a new tab', () => {
    render(<CompanyCard company={company} />);
    const link = screen.getByRole('link', { name: /lucid software/i });
    expect(link).toHaveAttribute('href', 'https://www.lucidsoftware.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('renders the Hiring badge when isHiring is true', () => {
    render(<CompanyCard company={company} />);
    expect(screen.getByText('Hiring')).toBeInTheDocument();
  });

  it('omits the Hiring badge when isHiring is false', () => {
    render(<CompanyCard company={{ ...company, isHiring: false }} />);
    expect(screen.queryByText('Hiring')).not.toBeInTheDocument();
  });

  it('caps topic badges at 3 in compact variant', () => {
    render(<CompanyCard company={company} />);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Go')).toBeInTheDocument();
    expect(screen.queryByText('AWS')).not.toBeInTheDocument();
  });
});
