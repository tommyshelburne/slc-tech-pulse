import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from './App';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  );
}

describe('AppRoutes', () => {
  it('renders HomePage at /', () => {
    renderAt('/');
    expect(
      screen.getByRole('heading', { level: 1, name: /what's happening in silicon slopes/i }),
    ).toBeInTheDocument();
  });

  it('renders EventsPage at /events', () => {
    renderAt('/events');
    expect(screen.getByRole('heading', { level: 1, name: /^events$/i })).toBeInTheDocument();
  });

  it('renders EventDetailPage at /events/:id', () => {
    renderAt('/events/react-slc-may-2026');
    // The Back link renders regardless of load state, which is enough to
    // confirm the route resolved to EventDetailPage.
    expect(screen.getByRole('link', { name: /back to events/i })).toBeInTheDocument();
  });

  it('renders JobsPage at /jobs', () => {
    renderAt('/jobs');
    expect(screen.getByRole('heading', { level: 1, name: /^jobs$/i })).toBeInTheDocument();
  });

  it('renders CompaniesPage at /companies', () => {
    renderAt('/companies');
    expect(screen.getByRole('heading', { level: 1, name: /^companies$/i })).toBeInTheDocument();
  });

  it('renders AboutPage at /about', () => {
    renderAt('/about');
    expect(screen.getByRole('heading', { level: 1, name: /about slc tech pulse/i })).toBeInTheDocument();
  });

  it('renders Header nav + Footer on every route', () => {
    renderAt('/about');
    expect(screen.getByRole('navigation', { name: /primary/i })).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    for (const label of ['Events', 'Jobs', 'Companies', 'About']) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
    }
  });
});
