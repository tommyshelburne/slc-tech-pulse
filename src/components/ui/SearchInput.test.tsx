import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchInput } from './SearchInput';

describe('SearchInput', () => {
  it('renders with placeholder', () => {
    render(<SearchInput value="" onChange={() => {}} placeholder="Find events" />);
    expect(screen.getByPlaceholderText('Find events')).toBeInTheDocument();
  });

  it('reflects the value prop', () => {
    render(<SearchInput value="react" onChange={() => {}} />);
    expect(screen.getByDisplayValue('react')).toBeInTheDocument();
  });

  it('calls onChange with typed text', async () => {
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} />);
    await userEvent.type(screen.getByRole('textbox'), 'go');
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith('o');
  });
});
