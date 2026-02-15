import type { FormEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';

export default function HeaderSearchBar() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const urlQuery = searchParams.get('q') ?? '';
  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const navigate = useNavigate();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    setSearchQuery(urlQuery);
  }, [urlQuery]);

  const isOnSearchPage = location.pathname === '/search';

  const navigateToSearch = useCallback(
    (query: string) => {
      const trimmed = query.trim();
      const path = trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search';
      navigate(path, { replace: isOnSearchPage });
    },
    [navigate, isOnSearchPage],
  );

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed === urlQuery) return;
    if (trimmed.length > 0 && trimmed.length < 2) return;
    if (trimmed.length === 0 && !isOnSearchPage) return;

    debounceRef.current = setTimeout(() => navigateToSearch(searchQuery), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, urlQuery, isOnSearchPage, navigateToSearch]);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    navigateToSearch(searchQuery);
  }

  return (
    <form className="d-flex me-3" role="search" onSubmit={handleSearch}>
      <label htmlFor="header-search" className="visually-hidden">
        Search
      </label>
      <div
        className="input-group rounded-pill overflow-hidden"
        style={{ border: '2px solid transparent' }}
      >
        <span className="input-group-text border-0 bg-body-secondary pe-0">
          <i className="bi bi-search" aria-hidden="true" />
        </span>
        <input
          type="search"
          className="form-control border-0 bg-body-secondary shadow-none ps-2"
          id="header-search"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={(e) => {
            const group = e.currentTarget.closest('.input-group') as HTMLElement | null;
            group?.style.setProperty('border-color', 'var(--bs-primary)');
          }}
          onBlur={(e) => {
            const group = e.currentTarget.closest('.input-group') as HTMLElement | null;
            group?.style.setProperty('border-color', 'transparent');
          }}
        />
      </div>
    </form>
  );
}
