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
  it('renders HomePage at /', async () => {
    renderAt('/');
    expect(
      await screen.findByRole('heading', { level: 1, name: /what's happening in silicon slopes/i }),
    ).toBeInTheDocument();
  });

  it('renders EventsPage at /events', async () => {
    renderAt('/events');
    expect(await screen.findByRole('heading', { level: 1, name: /^events$/i })).toBeInTheDocument();
  });

  it('renders EventDetailPage at /events/:id', async () => {
    renderAt('/events/react-slc-may-2026');
    // The Back link renders regardless of load state, which is enough to
    // confirm the route resolved to EventDetailPage.
    expect(await screen.findByRole('link', { name: /back to events/i })).toBeInTheDocument();
  });

  it('renders JobsPage at /jobs', async () => {
    renderAt('/jobs');
    expect(await screen.findByRole('heading', { level: 1, name: /^jobs$/i })).toBeInTheDocument();
  });

  it('renders CompaniesPage at /companies', async () => {
    renderAt('/companies');
    expect(await screen.findByRole('heading', { level: 1, name: /^companies$/i })).toBeInTheDocument();
  });

  it('renders AboutPage at /about', async () => {
    renderAt('/about');
    expect(
      await screen.findByRole('heading', { level: 1, name: /about slc tech pulse/i }),
    ).toBeInTheDocument();
  });

  it('renders Header nav + Footer on every route', async () => {
    renderAt('/about');
    expect(await screen.findByRole('navigation', { name: /primary/i })).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    for (const label of ['Events', 'Jobs', 'Companies', 'About']) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
    }
  });
});
