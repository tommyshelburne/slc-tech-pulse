import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { EventCard } from './EventCard';
import type { Event } from '../../types/event';

const event: Event = {
  id: 'react-slc-may',
  title: 'React SLC · May Meetup',
  shortDescription: 'Lightning talks on React 19.',
  description: '',
  date: '2026-05-15T18:00:00-06:00',
  location: 'Salt Lake City, UT',
  isOnline: false,
  url: 'https://meetup.com/react-slc',
  topics: ['React', 'TypeScript', 'Frontend'],
  company: 'React SLC',
  isFeatured: true,
  source: 'meetup',
  createdAt: '',
  updatedAt: '',
};

function renderInRouter(ui: React.ReactNode) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('EventCard', () => {
  it('links to the event detail route', () => {
    renderInRouter(<EventCard event={event} />);
    const link = screen.getByRole('link', { name: /react slc · may meetup/i });
    expect(link).toHaveAttribute('href', '/events/react-slc-may');
  });

  it('renders title, organizer, short description, and location', () => {
    renderInRouter(<EventCard event={event} />);
    expect(screen.getByRole('heading', { name: /react slc · may meetup/i })).toBeInTheDocument();
    expect(screen.getByText('React SLC')).toBeInTheDocument();
    expect(screen.getByText('Lightning talks on React 19.')).toBeInTheDocument();
    expect(screen.getByText(/Salt Lake City, UT/)).toBeInTheDocument();
  });

  it('shows the date badge with uppercase month and numeric day', () => {
    renderInRouter(<EventCard event={event} />);
    expect(screen.getByText('MAY')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('shows Online indicator instead of location when isOnline', () => {
    renderInRouter(<EventCard event={{ ...event, isOnline: true }} />);
    expect(screen.getByText(/Online/)).toBeInTheDocument();
    expect(screen.queryByText(/Salt Lake City/)).not.toBeInTheDocument();
  });

  it('caps topic badges in compact variant', () => {
    renderInRouter(<EventCard event={event} />);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.queryByText('Frontend')).not.toBeInTheDocument();
  });
});

describe('EventCard — full variant', () => {
  it('links the title to the detail route and the Register button to the external URL', () => {
    renderInRouter(<EventCard event={event} variant="full" />);

    const titleLink = screen.getByRole('link', { name: /react slc · may meetup/i });
    expect(titleLink).toHaveAttribute('href', '/events/react-slc-may');

    const registerLink = screen.getByRole('link', { name: /view event page/i });
    expect(registerLink).toHaveAttribute('href', 'https://meetup.com/react-slc');
    expect(registerLink).toHaveAttribute('target', '_blank');
    expect(registerLink).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('shows more topic badges than compact', () => {
    renderInRouter(<EventCard event={event} variant="full" />);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Frontend')).toBeInTheDocument();
  });
});
