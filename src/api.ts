import type { BarcodeData, PreparationData, ProductGroupData, ServingSizeData } from './domain';

export interface ApiProductSummary {
  id: string;
  name: string;
  brand?: string;
}

export interface ApiProduct {
  id: string;
  name: string;
  brand?: string;
  barcodes?: BarcodeData[];
  preparations?: PreparationData[];
  defaultPreparationID?: string;
  notes?: unknown[];
}

export interface ApiGroupSummary {
  id: string;
  name: string;
  items: { id?: string; name?: string; product?: unknown; group?: unknown }[];
}

export interface ApiLookupItem {
  product?: ApiProduct;
  preparationID?: string;
  group?: ProductGroupData;
}

export interface ApiVersion {
  version: string;
  debug?: boolean;
}

// Runtime config (Docker) or build-time config (local dev)
const getApiBase = (): string => {
  if (
    typeof window !== 'undefined' &&
    window.__RUNTIME_CONFIG__?.API_BASE_URL &&
    window.__RUNTIME_CONFIG__.API_BASE_URL !== '__API_BASE_URL__'
  ) {
    return window.__RUNTIME_CONFIG__.API_BASE_URL;
  }
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
};

const getApiDisplayUrl = (): string => {
  if (
    typeof window !== 'undefined' &&
    window.__RUNTIME_CONFIG__?.API_DISPLAY_URL &&
    window.__RUNTIME_CONFIG__.API_DISPLAY_URL !== '__API_DISPLAY_URL__'
  ) {
    return window.__RUNTIME_CONFIG__.API_DISPLAY_URL;
  }
  return getApiBase();
};

export const API_BASE = getApiBase();
export const API_DISPLAY_URL = getApiDisplayUrl();

async function apiFetch<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

async function apiPost<TReq, TRes>(endpoint: string, body: TReq): Promise<TRes> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json() as Promise<TRes>;
}

export interface LogEntryRequest {
  productId?: string;
  groupId?: string;
  preparationId?: string;
  servingSize: ServingSizeData;
}

export interface LogEntryResponse {
  id: string;
}

export async function lookupBarcode(barcode: string): Promise<ApiLookupItem[]> {
  return apiFetch<ApiLookupItem[]>(`/lookup/${encodeURIComponent(barcode)}`);
}

export async function listProducts(): Promise<ApiProductSummary[]> {
  return apiFetch<ApiProductSummary[]>('/products');
}

export async function getProduct(id: string): Promise<ApiProduct> {
  return apiFetch<ApiProduct>(`/products/${encodeURIComponent(id)}`);
}

export async function listGroups(): Promise<ApiGroupSummary[]> {
  return apiFetch<ApiGroupSummary[]>('/groups');
}

export async function getGroup(id: string): Promise<ProductGroupData> {
  return apiFetch<ProductGroupData>(`/groups/${encodeURIComponent(id)}`);
}

export async function getVersion(): Promise<ApiVersion> {
  return apiFetch<ApiVersion>('/version');
}

export async function logEntry(entry: LogEntryRequest): Promise<LogEntryResponse> {
  return apiPost<LogEntryRequest, LogEntryResponse>('/log', entry);
}
