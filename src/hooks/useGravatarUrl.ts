import { useEffect, useState } from 'react';

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function useGravatarUrl(email: string | undefined, size: number = 32): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!email) return;
    let cancelled = false;
    sha256Hex(email.trim().toLowerCase()).then((hash) => {
      if (!cancelled) {
        setUrl(`https://www.gravatar.com/avatar/${hash}?s=${size * 2}&d=mp`);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [email, size]);

  return email ? url : null;
}
