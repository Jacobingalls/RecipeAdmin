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
    document.documentElement.removeAttribute('data-bs-theme');
    darkModeMatches = false;
    window.matchMedia = createMockMatchMedia() as typeof window.matchMedia;
  });

  it('defaults to light when system preference is light', () => {
    darkModeMatches = false;
    const { result } = renderHook(() => useTheme());
    expect(result.current).toBe('light');
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('light');
  });

  it('defaults to dark when system preference is dark', () => {
    darkModeMatches = true;
    const { result } = renderHook(() => useTheme());
    expect(result.current).toBe('dark');
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark');
  });

  it('sets data-bs-theme attribute on document element', () => {
    renderHook(() => useTheme());
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('light');
  });

  it('responds to system preference changes', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current).toBe('light');

    act(() => fireMediaChange(true));

    expect(result.current).toBe('dark');
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark');
  });

  it('cleans up media query listener on unmount', () => {
    const { unmount } = renderHook(() => useTheme());
    const listeners = matchMediaListeners.get('(prefers-color-scheme: dark)') ?? [];
    expect(listeners).toHaveLength(1);

    unmount();

    const listenersAfter = matchMediaListeners.get('(prefers-color-scheme: dark)') ?? [];
    expect(listenersAfter).toHaveLength(0);
  });
});
