import {
  lookupBarcode,
  listProducts,
  getProduct,
  listGroups,
  getGroup,
  getVersion,
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

    expect(mockFetch).toHaveBeenCalledWith(`${API_BASE}/products`);
    expect(result).toEqual(products);
  });
});

describe('getProduct', () => {
  it('calls /products/:id endpoint', async () => {
    const product = { id: '42', name: 'Banana' };
    mockFetch.mockResolvedValue(mockResponse(product));

    const result = await getProduct('42');

    expect(mockFetch).toHaveBeenCalledWith(`${API_BASE}/products/42`);
    expect(result).toEqual(product);
  });

  it('encodes the id parameter', async () => {
    mockFetch.mockResolvedValue(mockResponse({}));

    await getProduct('foo/bar');

    expect(mockFetch).toHaveBeenCalledWith(`${API_BASE}/products/foo%2Fbar`);
  });
});

describe('listGroups', () => {
  it('calls /groups endpoint', async () => {
    const groups = [{ id: '1', name: 'Cereals' }];
    mockFetch.mockResolvedValue(mockResponse(groups));

    const result = await listGroups();

    expect(mockFetch).toHaveBeenCalledWith(`${API_BASE}/groups`);
    expect(result).toEqual(groups);
  });
});

describe('getGroup', () => {
  it('calls /groups/:id endpoint', async () => {
    const group = { id: '5', name: 'Snacks' };
    mockFetch.mockResolvedValue(mockResponse(group));

    const result = await getGroup('5');

    expect(mockFetch).toHaveBeenCalledWith(`${API_BASE}/groups/5`);
    expect(result).toEqual(group);
  });

  it('encodes the id parameter', async () => {
    mockFetch.mockResolvedValue(mockResponse({}));

    await getGroup('a b');

    expect(mockFetch).toHaveBeenCalledWith(`${API_BASE}/groups/a%20b`);
  });
});

describe('lookupBarcode', () => {
  it('calls /lookup/:barcode endpoint', async () => {
    const items = [{ product: { id: '1', name: 'Item' } }];
    mockFetch.mockResolvedValue(mockResponse(items));

    const result = await lookupBarcode('123456');

    expect(mockFetch).toHaveBeenCalledWith(`${API_BASE}/lookup/123456`);
    expect(result).toEqual(items);
  });

  it('encodes the barcode parameter', async () => {
    mockFetch.mockResolvedValue(mockResponse([]));

    await lookupBarcode('bar/code');

    expect(mockFetch).toHaveBeenCalledWith(`${API_BASE}/lookup/bar%2Fcode`);
  });
});

describe('getVersion', () => {
  it('calls /version endpoint', async () => {
    const version = { version: '1.2.3' };
    mockFetch.mockResolvedValue(mockResponse(version));

    const result = await getVersion();

    expect(mockFetch).toHaveBeenCalledWith(`${API_BASE}/version`);
    expect(result).toEqual(version);
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
