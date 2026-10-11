const DEFAULT_RETURN_PATH = '/';

/** Only same-app paths are allowed, so a crafted link can't redirect to another site. */
export function safeReturnPath(candidate: unknown): string {
  if (typeof candidate !== 'string') return DEFAULT_RETURN_PATH;
  if (!candidate.startsWith('/')) return DEFAULT_RETURN_PATH;
  // Browsers treat `//host` and `/\host` as protocol-relative URLs to another origin.
  if (candidate.startsWith('//') || candidate.startsWith('/\\')) return DEFAULT_RETURN_PATH;
  return candidate;
}

export interface ReturnLocationState {
  from: string;
}

export function returnPathFromState(state: unknown): string {
  if (state && typeof state === 'object' && 'from' in state) {
    return safeReturnPath(state.from);
  }
  return DEFAULT_RETURN_PATH;
}
