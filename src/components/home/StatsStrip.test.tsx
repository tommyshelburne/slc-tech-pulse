import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsStrip } from './StatsStrip';

describe('StatsStrip', () => {
  it('renders each stat with its label and value', () => {
    render(
      <StatsStrip
        stats={[
          { label: 'Upcoming Events', value: 8 },
          { label: 'Open Jobs', value: 15 },
          { label: 'Companies', value: 12 },
          { label: 'This Week', value: 2 },
        ]}
      />,
    );

    expect(screen.getByText('Upcoming Events')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('Open Jobs')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('Companies')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('This Week')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('uses a list role', () => {
    render(<StatsStrip stats={[{ label: 'x', value: 0 }]} />);
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
  });
});
