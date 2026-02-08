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
  const res = await fetch(`${API_BASE}${endpoint}`, { credentials: 'include' });
  if (!res.ok) {
    if (res.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

async function apiPost<TReq, TRes>(endpoint: string, body: TReq): Promise<TRes> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  });
  if (!res.ok) {
    if (res.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json() as Promise<TRes>;
}

async function apiDelete(endpoint: string): Promise<void> {
  const res = await fetch(`${API_BASE}${endpoint}`, { method: 'DELETE', credentials: 'include' });
  if (!res.ok) {
    if (res.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    throw new Error(`HTTP ${res.status}`);
  }
}

async function apiPut<TReq, TRes>(endpoint: string, body: TReq): Promise<TRes> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  });
  if (!res.ok) {
    if (res.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json() as Promise<TRes>;
}

export interface ApiLogItem {
  kind: string;
  productID?: string;
  groupID?: string;
  preparationID?: string;
  servingSize: ServingSizeData;
}

export interface ApiLogEntry {
  id: string;
  timestamp: number;
  userID: string;
  item: ApiLogItem;
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

export async function getLogs(from?: number, to?: number): Promise<ApiLogEntry[]> {
  const params = new URLSearchParams();
  if (from !== undefined) params.set('from', String(from));
  if (to !== undefined) params.set('to', String(to));
  const query = params.toString();
  return apiFetch<ApiLogEntry[]>(`/logs${query ? `?${query}` : ''}`);
}

export async function logEntry(entry: LogEntryRequest): Promise<LogEntryResponse> {
  const body = entry.groupId
    ? { kind: 'group', groupID: entry.groupId, servingSize: entry.servingSize }
    : {
        kind: 'product',
        productID: entry.productId,
        preparationID: entry.preparationId,
        servingSize: entry.servingSize,
      };
  return apiPost<typeof body, LogEntryResponse>('/logs', body);
}

export async function updateLogEntryServingSize(
  id: string,
  servingSize: ServingSizeData,
): Promise<ApiLogEntry> {
  return apiPut<ServingSizeData, ApiLogEntry>(
    `/logs/${encodeURIComponent(id)}/serving-size`,
    servingSize,
  );
}

export async function deleteLog(id: string): Promise<void> {
  return apiDelete(`/logs/${encodeURIComponent(id)}`);
}

// Auth types

export interface AuthUser {
  id: string;
  username: string;
  isAdmin: boolean;
  hasPasskeys: boolean;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
  isTemporaryKey: boolean;
}

export interface PasskeyInfo {
  id: string;
  name: string;
  createdAt: number | null;
  lastUsedAt: number | null;
}

export interface APIKeyInfo {
  id: string;
  name: string;
  keyPrefix: string;
  isTemporary: boolean;
  createdAt: number | null;
  lastUsedAt: number | null;
  expiresAt: number | null;
}

export interface CreateAPIKeyResponse {
  id: string;
  name: string;
  key: string;
  keyPrefix: string;
  expiresAt: number | null;
}

export interface AdminUserListItem {
  id: string;
  username: string;
  isAdmin: boolean;
  createdAt: number | null;
  passkeyCount: number;
  apiKeyCount: number;
}

export interface AdminCreateUserResponse {
  user: AdminUserListItem;
  temporaryAPIKey: string;
}

export interface AdminTempAPIKeyResponse {
  id: string;
  key: string;
  keyPrefix: string;
  expiresAt: number;
}

// Auth API functions

export async function authLogin(username: string, password: string): Promise<LoginResponse> {
  return apiPost<{ username: string; password: string }, LoginResponse>('/auth/login', {
    username,
    password,
  });
}

export async function authLoginBegin(
  username?: string,
): Promise<{ options: unknown; sessionID: string }> {
  return apiPost<{ username?: string }, { options: unknown; sessionID: string }>(
    '/auth/login/begin',
    { username },
  );
}

export async function authLoginFinish(
  sessionID: string,
  credential: unknown,
): Promise<LoginResponse> {
  return apiPost<{ sessionID: string; credential: unknown }, LoginResponse>('/auth/login/finish', {
    sessionID,
    credential,
  });
}

export async function authMe(): Promise<AuthUser> {
  return apiFetch<AuthUser>('/auth/me');
}

export async function authLogout(): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

export async function authListPasskeys(): Promise<PasskeyInfo[]> {
  return apiFetch<PasskeyInfo[]>('/auth/passkeys');
}

export async function authAddPasskeyBegin(): Promise<{ options: unknown; sessionID: string }> {
  return apiPost<Record<string, never>, { options: unknown; sessionID: string }>(
    '/auth/passkeys/begin',
    {},
  );
}

export async function authAddPasskeyFinish(
  sessionID: string,
  credential: unknown,
  name: string,
): Promise<PasskeyInfo> {
  return apiPost<{ sessionID: string; credential: unknown; name: string }, PasskeyInfo>(
    '/auth/passkeys/finish',
    { sessionID, credential, name },
  );
}

export async function authDeletePasskey(id: string): Promise<void> {
  return apiDelete(`/auth/passkeys/${encodeURIComponent(id)}`);
}

export async function authListAPIKeys(): Promise<APIKeyInfo[]> {
  return apiFetch<APIKeyInfo[]>('/auth/api-keys');
}

export async function authCreateAPIKey(
  name: string,
  expiresAt?: number,
): Promise<CreateAPIKeyResponse> {
  return apiPost<{ name: string; expiresAt?: number }, CreateAPIKeyResponse>('/auth/api-keys', {
    name,
    expiresAt,
  });
}

export async function authRevokeAPIKey(id: string): Promise<void> {
  return apiDelete(`/auth/api-keys/${encodeURIComponent(id)}`);
}

// Admin API functions

export async function adminListUsers(): Promise<AdminUserListItem[]> {
  return apiFetch<AdminUserListItem[]>('/admin/users');
}

export async function adminCreateUser(
  username: string,
  isAdmin: boolean,
): Promise<AdminCreateUserResponse> {
  return apiPost<{ username: string; isAdmin: boolean }, AdminCreateUserResponse>('/admin/users', {
    username,
    isAdmin,
  });
}

export async function adminUpdateUser(
  id: string,
  data: { username?: string; isAdmin?: boolean },
): Promise<AdminUserListItem> {
  return apiPut<{ username?: string; isAdmin?: boolean }, AdminUserListItem>(
    `/admin/users/${encodeURIComponent(id)}`,
    data,
  );
}

export async function adminDeleteUser(id: string): Promise<void> {
  return apiDelete(`/admin/users/${encodeURIComponent(id)}`);
}

export async function adminListUserPasskeys(userId: string): Promise<PasskeyInfo[]> {
  return apiFetch<PasskeyInfo[]>(`/admin/users/${encodeURIComponent(userId)}/passkeys`);
}

export async function adminDeleteUserPasskey(userId: string, passkeyId: string): Promise<void> {
  return apiDelete(
    `/admin/users/${encodeURIComponent(userId)}/passkeys/${encodeURIComponent(passkeyId)}`,
  );
}

export async function adminListUserAPIKeys(userId: string): Promise<APIKeyInfo[]> {
  return apiFetch<APIKeyInfo[]>(`/admin/users/${encodeURIComponent(userId)}/api-keys`);
}

export async function adminDeleteUserAPIKey(userId: string, keyId: string): Promise<void> {
  return apiDelete(
    `/admin/users/${encodeURIComponent(userId)}/api-keys/${encodeURIComponent(keyId)}`,
  );
}

export async function adminCreateUserAPIKey(userId: string): Promise<AdminTempAPIKeyResponse> {
  return apiPost<Record<string, never>, AdminTempAPIKeyResponse>(
    `/admin/users/${encodeURIComponent(userId)}/api-keys`,
    {},
  );
}
