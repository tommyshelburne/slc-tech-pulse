import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AboutPage from './AboutPage';

describe('AboutPage', () => {
  it('renders the heading and main sections', () => {
    render(<AboutPage />);
    expect(screen.getByRole('heading', { level: 1, name: /about slc tech pulse/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /what you'll find here/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /how data is sourced/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /submit an event or job/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /built with/i })).toBeInTheDocument();
  });

  it('links the submission email', () => {
    render(<AboutPage />);
    const links = screen.getAllByRole('link');
    const emails = links.filter((l) => l.getAttribute('href')?.startsWith('mailto:'));
    expect(emails.length).toBeGreaterThanOrEqual(2);
  });
});
