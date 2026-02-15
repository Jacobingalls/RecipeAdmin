import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import HeaderSearchBar from './HeaderSearchBar';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderOnRoute(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="*" element={<HeaderSearchBar />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('HeaderSearchBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders a search input', () => {
    renderOnRoute('/');
    expect(screen.getByLabelText('Search')).toBeInTheDocument();
  });

  it('renders a search form with role="search"', () => {
    renderOnRoute('/');
    expect(screen.getByRole('search')).toBeInTheDocument();
  });

  it('initializes input value from URL query param', () => {
    renderOnRoute('/search?q=oats');
    const input = screen.getByLabelText('Search') as HTMLInputElement;
    expect(input.value).toBe('oats');
  });

  it('navigates to search page on form submission', () => {
    renderOnRoute('/');
    const input = screen.getByLabelText('Search');
    fireEvent.change(input, { target: { value: 'banana' } });
    fireEvent.submit(screen.getByRole('search'));

    expect(mockNavigate).toHaveBeenCalledWith('/search?q=banana', { replace: false });
  });

  it('navigates with replace when already on search page', () => {
    renderOnRoute('/search?q=old');
    const input = screen.getByLabelText('Search');
    fireEvent.change(input, { target: { value: 'new' } });
    fireEvent.submit(screen.getByRole('search'));

    expect(mockNavigate).toHaveBeenCalledWith('/search?q=new', { replace: true });
  });

  it('trims whitespace from search query on submit', () => {
    renderOnRoute('/');
    const input = screen.getByLabelText('Search');
    fireEvent.change(input, { target: { value: '  oats  ' } });
    fireEvent.submit(screen.getByRole('search'));

    expect(mockNavigate).toHaveBeenCalledWith('/search?q=oats', { replace: false });
  });

  it('navigates to /search without query param when input is empty on submit', () => {
    renderOnRoute('/search?q=old');
    const input = screen.getByLabelText('Search');
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.submit(screen.getByRole('search'));

    expect(mockNavigate).toHaveBeenCalledWith('/search', { replace: true });
  });

  it('debounces navigation when typing (does not navigate before 300ms)', () => {
    renderOnRoute('/');
    const input = screen.getByLabelText('Search');
    fireEvent.change(input, { target: { value: 'ab' } });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('triggers navigation after 300ms debounce for queries >= 2 chars', () => {
    renderOnRoute('/');
    const input = screen.getByLabelText('Search');
    fireEvent.change(input, { target: { value: 'ab' } });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/search?q=ab', { replace: false });
  });

  it('does not auto-navigate for single character queries', () => {
    renderOnRoute('/');
    const input = screen.getByLabelText('Search');
    fireEvent.change(input, { target: { value: 'a' } });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('cancels pending debounce on form submission', () => {
    renderOnRoute('/');
    const input = screen.getByLabelText('Search');
    fireEvent.change(input, { target: { value: 'oats' } });

    // Submit before debounce fires
    fireEvent.submit(screen.getByRole('search'));
    expect(mockNavigate).toHaveBeenCalledTimes(1);

    // Advancing past the debounce should not trigger a second navigation
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });

  it('encodes special characters in the search query', () => {
    renderOnRoute('/');
    const input = screen.getByLabelText('Search');
    fireEvent.change(input, { target: { value: 'oats & honey' } });
    fireEvent.submit(screen.getByRole('search'));

    expect(mockNavigate).toHaveBeenCalledWith('/search?q=oats%20%26%20honey', {
      replace: false,
    });
  });

  it('has a placeholder of "Search..."', () => {
    renderOnRoute('/');
    const input = screen.getByLabelText('Search') as HTMLInputElement;
    expect(input.placeholder).toBe('Search...');
  });
});
