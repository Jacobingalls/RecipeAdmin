import { returnPathFromState, safeReturnPath } from './returnPath';

describe('safeReturnPath', () => {
  it.each(['/', '/settings', '/oauth/consent?request=abc.def', '/products/1#prep'])(
    'keeps the in-app path %s',
    (path) => {
      expect(safeReturnPath(path)).toBe(path);
    },
  );

  it.each([
    ['a protocol-relative URL', '//evil.example.com/oauth'],
    ['a backslash protocol-relative URL', '/\\evil.example.com'],
    ['an absolute URL', 'https://evil.example.com'],
    ['a javascript URL', 'javascript:alert(1)'],
    ['a relative path', 'settings'],
    ['an empty string', ''],
  ])('falls back to home for %s', (_label, path) => {
    expect(safeReturnPath(path)).toBe('/');
  });

  it.each([undefined, null, 42, { pathname: '/settings' }])(
    'falls back to home for the non-string %s',
    (value) => {
      expect(safeReturnPath(value)).toBe('/');
    },
  );
});

describe('returnPathFromState', () => {
  it('reads the from path out of location state', () => {
    expect(returnPathFromState({ from: '/oauth/consent?request=abc' })).toBe(
      '/oauth/consent?request=abc',
    );
  });

  it('rejects an unsafe from path', () => {
    expect(returnPathFromState({ from: '//evil.example.com' })).toBe('/');
  });

  it.each([undefined, null, 'string-state', { other: '/settings' }])(
    'falls back to home when state is %s',
    (state) => {
      expect(returnPathFromState(state)).toBe('/');
    },
  );
});
