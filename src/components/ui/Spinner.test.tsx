import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('renders without error', () => {
    const { container } = render(<Spinner />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('accepts a size prop', () => {
    const { container } = render(<Spinner size={48} />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
