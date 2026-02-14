import {
  lookupBarcode,
  listProducts,
  getProduct,
  listGroups,
  getGroup,
  getVersion,
  getStatus,
  logEntry,
  getTokenExpiry,
  API_BASE,
  API_DISPLAY_URL,
} from './api';

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

function mockResponse(data: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: () => Promise.resolve(data),
  };
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe('API_BASE and API_DISPLAY_URL', () => {
  it('resolves to a string', () => {
    expect(typeof API_BASE).toBe('string');
    expect(typeof API_DISPLAY_URL).toBe('string');
  });

  it('defaults to localhost when no runtime config', () => {
    expect(API_BASE).toBe('http://localhost:8080');
  });

  it('uses runtime config API_BASE_URL when set', async () => {
    window.__RUNTIME_CONFIG__ = {
      API_BASE_URL: 'https://runtime.example.com',
      API_DISPLAY_URL: '__API_DISPLAY_URL__',
    };
    try {
      vi.resetModules();
      const mod = await import('./api');
      expect(mod.API_BASE).toBe('https://runtime.example.com');
    } finally {
      delete window.__RUNTIME_CONFIG__;
    }
  });

  it('ignores runtime config when API_BASE_URL is placeholder', async () => {
    window.__RUNTIME_CONFIG__ = {
      API_BASE_URL: '__API_BASE_URL__',
      API_DISPLAY_URL: '__API_DISPLAY_URL__',
    };
    try {
      vi.resetModules();
      const mod = await import('./api');
      expect(mod.API_BASE).toBe('http://localhost:8080');
    } finally {
      delete window.__RUNTIME_CONFIG__;
    }
  });

  it('uses runtime config API_DISPLAY_URL when set', async () => {
    window.__RUNTIME_CONFIG__ = {
      API_BASE_URL: 'https://runtime.example.com',
      API_DISPLAY_URL: 'https://display.example.com',
    };
    try {
      vi.resetModules();
      const mod = await import('./api');
      expect(mod.API_DISPLAY_URL).toBe('https://display.example.com');
    } finally {
      delete window.__RUNTIME_CONFIG__;
    }
  });

  it('falls back API_DISPLAY_URL to API_BASE when display URL is placeholder', async () => {
    window.__RUNTIME_CONFIG__ = {
      API_BASE_URL: 'https://runtime.example.com',
      API_DISPLAY_URL: '__API_DISPLAY_URL__',
    };
    try {
      vi.resetModules();
      const mod = await import('./api');
      expect(mod.API_DISPLAY_URL).toBe('https://runtime.example.com');
    } finally {
      delete window.__RUNTIME_CONFIG__;
    }
  });
});

describe('listProducts', () => {
  it('calls /products endpoint', async () => {
    const products = [{ id: '1', name: 'Apple' }];
    mockFetch.mockResolvedValue(mockResponse(products));

    const result = await listProducts();

    expect(mockFetch).toHaveBeenCalledWith(`${API_BASE}/products`, { credentials: 'include' });
    expect(result).toEqual(products);
  });
});

describe('getProduct', () => {
  it('calls /products/:id endpoint', async () => {
    const product = { id: '42', name: 'Banana' };
    mockFetch.mockResolvedValue(mockResponse(product));

    const result = await getProduct('42');

    expect(mockFetch).toHaveBeenCalledWith(`${API_BASE}/products/42`, { credentials: 'include' });
    expect(result).toEqual(product);
  });

  it('encodes the id parameter', async () => {
    mockFetch.mockResolvedValue(mockResponse({}));

    await getProduct('foo/bar');

    expect(mockFetch).toHaveBeenCalledWith(`${API_BASE}/products/foo%2Fbar`, {
      credentials: 'include',
    });
  });
});

describe('listGroups', () => {
  it('calls /groups endpoint', async () => {
    const groups = [{ id: '1', name: 'Cereals' }];
    mockFetch.mockResolvedValue(mockResponse(groups));

    const result = await listGroups();

    expect(mockFetch).toHaveBeenCalledWith(`${API_BASE}/groups`, { credentials: 'include' });
    expect(result).toEqual(groups);
  });
});

describe('getGroup', () => {
  it('calls /groups/:id endpoint', async () => {
    const group = { id: '5', name: 'Snacks' };
    mockFetch.mockResolvedValue(mockResponse(group));

    const result = await getGroup('5');

    expect(mockFetch).toHaveBeenCalledWith(`${API_BASE}/groups/5`, { credentials: 'include' });
    expect(result).toEqual(group);
  });

  it('encodes the id parameter', async () => {
    mockFetch.mockResolvedValue(mockResponse({}));

    await getGroup('a b');

    expect(mockFetch).toHaveBeenCalledWith(`${API_BASE}/groups/a%20b`, {
      credentials: 'include',
    });
  });
});

describe('lookupBarcode', () => {
  it('calls /lookup/:barcode endpoint', async () => {
    const items = [{ product: { id: '1', name: 'Item' } }];
    mockFetch.mockResolvedValue(mockResponse(items));

    const result = await lookupBarcode('123456');

    expect(mockFetch).toHaveBeenCalledWith(`${API_BASE}/lookup/123456`, {
      credentials: 'include',
    });
    expect(result).toEqual(items);
  });

  it('encodes the barcode parameter', async () => {
    mockFetch.mockResolvedValue(mockResponse([]));

    await lookupBarcode('bar/code');

    expect(mockFetch).toHaveBeenCalledWith(`${API_BASE}/lookup/bar%2Fcode`, {
      credentials: 'include',
    });
  });
});

describe('getVersion', () => {
  it('calls /version endpoint', async () => {
    const version = { version: '1.2.3' };
    mockFetch.mockResolvedValue(mockResponse(version));

    const result = await getVersion();

    expect(mockFetch).toHaveBeenCalledWith(`${API_BASE}/version`, { credentials: 'include' });
    expect(result).toEqual(version);
  });
});

describe('getStatus', () => {
  it('calls /status endpoint', async () => {
    const status = { version: '1.2.3', environment: 'production', debug: false, user: null };
    mockFetch.mockResolvedValue(mockResponse(status));

    const result = await getStatus();

    expect(mockFetch).toHaveBeenCalledWith(`${API_BASE}/status`, { credentials: 'include' });
    expect(result).toEqual(status);
  });
});

describe('logEntry', () => {
  it('POSTs to /logs with IndirectItem product format', async () => {
    const response = { id: 'log-1' };
    mockFetch.mockResolvedValue(mockResponse(response));

    const entry = {
      productId: 'p1',
      preparationId: 'prep1',
      servingSize: { kind: 'servings', amount: 2 },
    };
    const result = await logEntry(entry);

    expect(mockFetch).toHaveBeenCalledWith(`${API_BASE}/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        item: {
          kind: 'product',
          productID: 'p1',
          preparationID: 'prep1',
          servingSize: { kind: 'servings', amount: 2 },
        },
      }),
      credentials: 'include',
    });
    expect(result).toEqual(response);
  });

  it('POSTs with IndirectItem group format', async () => {
    mockFetch.mockResolvedValue(mockResponse({ id: 'log-2' }));

    await logEntry({
      groupId: 'g1',
      servingSize: { kind: 'servings', amount: 1 },
    });

    expect(mockFetch).toHaveBeenCalledWith(`${API_BASE}/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        item: {
          kind: 'group',
          groupID: 'g1',
          servingSize: { kind: 'servings', amount: 1 },
        },
      }),
      credentials: 'include',
    });
  });

  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValue(mockResponse(null, false, 422));

    await expect(logEntry({ servingSize: { kind: 'servings', amount: 1 } })).rejects.toThrow(
      'HTTP 422',
    );
  });
});

describe('getTokenExpiry', () => {
  function makeJwt(payload: Record<string, unknown>): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = btoa(JSON.stringify(payload));
    return `${header}.${body}.signature`;
  }

  it('returns exp from a valid JWT', () => {
    const token = makeJwt({ sub: 'user-1', exp: 1700000000 });
    expect(getTokenExpiry(token)).toBe(1700000000);
  });

  it('returns null for a token without exp claim', () => {
    const token = makeJwt({ sub: 'user-1' });
    expect(getTokenExpiry(token)).toBeNull();
  });

  it('returns null for an invalid token', () => {
    expect(getTokenExpiry('not-a-jwt')).toBeNull();
  });

  it('returns null for a token with non-numeric exp', () => {
    const token = makeJwt({ exp: 'not-a-number' });
    expect(getTokenExpiry(token)).toBeNull();
  });

  it('handles base64url encoding with - and _ characters', () => {
    // Create payload that would produce base64url chars
    const payload = { sub: 'user-1', exp: 1700000000, data: '>>>???' };
    const header = btoa(JSON.stringify({ alg: 'HS256' }))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    const body = btoa(JSON.stringify(payload))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    const token = `${header}.${body}.sig`;
    expect(getTokenExpiry(token)).toBe(1700000000);
  });
});

describe('error handling', () => {
  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValue(mockResponse(null, false, 404));

    await expect(listProducts()).rejects.toThrow('HTTP 404');
  });

  it('throws on 500 error', async () => {
    mockFetch.mockResolvedValue(mockResponse(null, false, 500));

    await expect(getProduct('1')).rejects.toThrow('HTTP 500');
  });
});
