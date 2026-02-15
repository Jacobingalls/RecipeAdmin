import { renderHook, waitFor } from '@testing-library/react';

import { useGravatarUrl } from './useGravatarUrl';

// SHA-256 of "test@example.com"
const expectedHash = '973dfe463ec85785f5f95af5ba3906eedb2d931c24e69824a89ea65dba4e813b';

describe('useGravatarUrl', () => {
  it('returns null when email is undefined', () => {
    const { result } = renderHook(() => useGravatarUrl(undefined));
    expect(result.current).toBeNull();
  });

  it('returns a gravatar URL with correct hash for a given email', async () => {
    const { result } = renderHook(() => useGravatarUrl('test@example.com'));
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });
    expect(result.current).toBe(`https://www.gravatar.com/avatar/${expectedHash}?s=64&d=mp`);
  });

  it('uses double the size parameter in URL', async () => {
    const { result } = renderHook(() => useGravatarUrl('test@example.com', 48));
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });
    expect(result.current).toContain('?s=96&d=mp');
  });

  it('trims and lowercases email before hashing', async () => {
    const { result } = renderHook(() => useGravatarUrl('  Test@Example.COM  '));
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });
    // Should produce the same hash as "test@example.com"
    expect(result.current).toBe(`https://www.gravatar.com/avatar/${expectedHash}?s=64&d=mp`);
  });

  it('uses default size of 32 producing s=64 in URL', async () => {
    const { result } = renderHook(() => useGravatarUrl('test@example.com'));
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });
    expect(result.current).toContain('?s=64&d=mp');
  });
});
