const LOOPBACK_HOSTNAMES = new Set(['localhost', '127.0.0.1', '[::1]']);

export interface OAuthRedirectTarget {
  /** The whole URI for custom schemes, whose "host" says little about which app opens. */
  host: string;
  isFamiliar: boolean;
}

/** Only Claude over HTTPS and loopback addresses count as familiar. */
export function describeOAuthRedirect(redirectURI: string): OAuthRedirectTarget {
  let url: URL;
  try {
    url = new URL(redirectURI);
  } catch {
    return { host: redirectURI, isFamiliar: false };
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    return { host: redirectURI, isFamiliar: false };
  }

  const isClaude = url.protocol === 'https:' && url.hostname === 'claude.ai';
  const isLoopback = LOOPBACK_HOSTNAMES.has(url.hostname);
  return { host: url.host, isFamiliar: isClaude || isLoopback };
}
