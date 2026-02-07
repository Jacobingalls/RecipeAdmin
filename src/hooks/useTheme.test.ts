import { renderHook, act } from '@testing-library/react';

import { useTheme } from './useTheme';

let matchMediaListeners: Map<string, ((e: MediaQueryListEvent) => void)[]>;
let darkModeMatches: boolean;

function createMockMatchMedia() {
  matchMediaListeners = new Map();
  return (query: string) => ({
    matches: query === '(prefers-color-scheme: dark)' ? darkModeMatches : false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: (_event: string, handler: (e: MediaQueryListEvent) => void) => {
      const listeners = matchMediaListeners.get(query) ?? [];
      listeners.push(handler);
      matchMediaListeners.set(query, listeners);
    },
    removeEventListener: (_event: string, handler: (e: MediaQueryListEvent) => void) => {
      const listeners = matchMediaListeners.get(query) ?? [];
      matchMediaListeners.set(
        query,
        listeners.filter((l) => l !== handler),
      );
    },
    dispatchEvent: vi.fn(),
  });
}

function fireMediaChange(matches: boolean) {
  const listeners = matchMediaListeners.get('(prefers-color-scheme: dark)') ?? [];
  for (const listener of listeners) {
    listener({ matches } as MediaQueryListEvent);
  }
}

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-bs-theme');
    darkModeMatches = false;
    window.matchMedia = createMockMatchMedia() as typeof window.matchMedia;
  });

  it('defaults to light when system preference is light', () => {
    darkModeMatches = false;
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('light');
  });

  it('defaults to dark when system preference is dark', () => {
    darkModeMatches = true;
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark');
  });

  it('reads saved theme from localStorage', () => {
    localStorage.setItem('theme', 'dark');
    darkModeMatches = false;
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
  });

  it('prefers localStorage over system preference', () => {
    localStorage.setItem('theme', 'light');
    darkModeMatches = true;
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');
  });

  it('toggles from light to dark', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');

    act(() => result.current.toggleTheme());

    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('toggles from dark to light', () => {
    darkModeMatches = true;
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');

    act(() => result.current.toggleTheme());

    expect(result.current.theme).toBe('light');
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('sets data-bs-theme attribute on document element', () => {
    renderHook(() => useTheme());
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('light');
  });

  it('responds to system preference changes when no saved preference', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');

    act(() => fireMediaChange(true));

    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark');
  });

  it('does not respond to system preference changes when preference is saved', () => {
    localStorage.setItem('theme', 'light');
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');

    act(() => fireMediaChange(true));

    expect(result.current.theme).toBe('light');
  });

  it('cleans up media query listener on unmount', () => {
    const { unmount } = renderHook(() => useTheme());
    const listeners = matchMediaListeners.get('(prefers-color-scheme: dark)') ?? [];
    expect(listeners).toHaveLength(1);

    unmount();

    const listenersAfter = matchMediaListeners.get('(prefers-color-scheme: dark)') ?? [];
    expect(listenersAfter).toHaveLength(0);
  });

  it('ignores invalid localStorage values', () => {
    localStorage.setItem('theme', 'invalid');
    darkModeMatches = true;
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
  });
});
