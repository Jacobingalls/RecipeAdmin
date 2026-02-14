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

export interface ApiSearchResult {
  item: ApiLookupItem;
  servingSize: ServingSizeData;
  relevance: number;
}

export interface ApiVersion {
  version: string;
  debug?: boolean;
}

export interface ApiStatus {
  version: string | null;
  environment: string | null;
  debug: boolean;
  user: AuthUser | null;
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

// Transparent token refresh: intercepts 401s, refreshes via cookie, retries once
let refreshPromise: Promise<number | null> | null = null;

/** Decode a JWT's `exp` claim without a library. Returns epoch seconds or null. */
export function getTokenExpiry(token: string): number | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}

/**
 * Attempt to refresh the access token via the refresh-token cookie.
 * Returns the new token's expiry (epoch seconds) on success, or null on failure.
 * Concurrent calls are deduplicated to a single in-flight request.
 */
export async function tryRefresh(): Promise<number | null> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) return null;
      const data = (await res.json()) as LoginResponse;
      return getTokenExpiry(data.token);
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

async function fetchWithRefresh(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init);
  if (res.status !== 401) return res;

  const expiry = await tryRefresh();
  if (expiry === null) return res;

  // Retry the original request with the new access token cookie
  return fetch(input, init);
}

async function apiFetch<T>(endpoint: string): Promise<T> {
  const res = await fetchWithRefresh(`${API_BASE}${endpoint}`, { credentials: 'include' });
  if (!res.ok) {
    if (res.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

async function apiPost<TReq, TRes>(endpoint: string, body: TReq): Promise<TRes> {
  const res = await fetchWithRefresh(`${API_BASE}${endpoint}`, {
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
  const res = await fetchWithRefresh(`${API_BASE}${endpoint}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) {
    if (res.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    throw new Error(`HTTP ${res.status}`);
  }
}

async function apiPut<TReq, TRes>(endpoint: string, body: TReq): Promise<TRes> {
  const res = await fetchWithRefresh(`${API_BASE}${endpoint}`, {
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
  timestamp?: number;
}

export interface LogEntryResponse {
  id: string;
}

export async function lookupBarcode(barcode: string): Promise<ApiSearchResult[]> {
  return apiFetch<ApiSearchResult[]>(`/lookup/${encodeURIComponent(barcode)}`);
}

export async function searchItems(query: string): Promise<ApiSearchResult[]> {
  return apiPost<{ query: string }, ApiSearchResult[]>('/search', { query });
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

export async function getStatus(): Promise<ApiStatus> {
  return apiFetch<ApiStatus>('/status');
}

export async function getLogs(from?: number, to?: number, limit?: number): Promise<ApiLogEntry[]> {
  const params = new URLSearchParams();
  if (from !== undefined) params.set('from', String(from));
  if (to !== undefined) params.set('to', String(to));
  if (limit !== undefined) params.set('limit', String(limit));
  const query = params.toString();
  return apiFetch<ApiLogEntry[]>(`/logs${query ? `?${query}` : ''}`);
}

export async function logEntry(entry: LogEntryRequest): Promise<LogEntryResponse> {
  const item = entry.groupId
    ? { kind: 'group', groupID: entry.groupId, servingSize: entry.servingSize }
    : {
        kind: 'product',
        productID: entry.productId,
        preparationID: entry.preparationId,
        servingSize: entry.servingSize,
      };
  const body: { item: typeof item; timestamp?: number } = { item };
  if (entry.timestamp !== undefined) {
    body.timestamp = entry.timestamp;
  }
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

export async function updateLogEntry(
  id: string,
  item: ApiLogItem,
  timestamp: number,
): Promise<ApiLogEntry> {
  return apiPut<{ item: ApiLogItem; timestamp: number }, ApiLogEntry>(
    `/logs/${encodeURIComponent(id)}`,
    { item, timestamp },
  );
}

export async function deleteLog(id: string): Promise<void> {
  return apiDelete(`/logs/${encodeURIComponent(id)}`);
}

// Favorites types

export interface ApiFavoriteItem {
  product?: ApiProduct;
  preparationID?: string;
  group?: ProductGroupData;
  servingSize: ServingSizeData;
}

export interface ApiFavorite {
  id: string;
  createdAt: number;
  lastUsedAt: number;
  item: ApiFavoriteItem;
}

export type CreateFavoriteRequest =
  | { kind: 'product'; productID: string; preparationID: string; servingSize: ServingSizeData }
  | { kind: 'group'; groupID: string; servingSize: ServingSizeData };

// Favorites API functions

export async function listFavorites(options?: {
  productID?: string;
  groupID?: string;
}): Promise<ApiFavorite[]> {
  const params = new URLSearchParams();
  if (options?.productID) params.set('productID', options.productID);
  if (options?.groupID) params.set('groupID', options.groupID);
  const query = params.toString();
  return apiFetch<ApiFavorite[]>(`/favorites${query ? `?${query}` : ''}`);
}

export async function createFavorite(request: CreateFavoriteRequest): Promise<ApiFavorite> {
  return apiPost<CreateFavoriteRequest, ApiFavorite>('/favorites', request);
}

export async function updateFavoriteServingSize(
  id: string,
  servingSize: ServingSizeData,
): Promise<ApiFavorite> {
  return apiPut<ServingSizeData, ApiFavorite>(
    `/favorites/${encodeURIComponent(id)}/serving-size`,
    servingSize,
  );
}

export async function touchFavoriteLastUsed(id: string): Promise<ApiFavorite> {
  return apiPut<Record<string, never>, ApiFavorite>(
    `/favorites/${encodeURIComponent(id)}/last-used`,
    {},
  );
}

export async function deleteFavorite(id: string): Promise<void> {
  return apiDelete(`/favorites/${encodeURIComponent(id)}`);
}

// Auth types

export interface AuthUser {
  id: string;
  username: string;
  displayName: string;
  email: string;
  isAdmin: boolean;
  hasPasskeys: boolean;
}

export interface LoginResponse {
  token: string;
  refreshToken?: string;
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
  displayName: string;
  email: string;
  isAdmin: boolean;
  createdAt: number | null;
  lastLoginAt: number | null;
  passkeyCount: number;
  apiKeyCount: number;
}

export interface AdminCreateUserResponse {
  user: AdminUserListItem;
  temporaryAPIKey: string;
}

export interface AdminAPIKeyInfo {
  id: string;
  name: string;
  isTemporary: boolean;
  createdAt: number | null;
  lastUsedAt: number | null;
  expiresAt: number | null;
}

export interface AdminUserDetail {
  id: string;
  username: string;
  displayName: string;
  email: string;
  isAdmin: boolean;
  createdAt: number | null;
  passkeys: PasskeyInfo[];
  apiKeys: AdminAPIKeyInfo[];
}

export interface AdminTempAPIKeyResponse {
  id: string;
  key: string;
  expiresAt: number;
}

// Auth API functions

export async function authLogin(
  usernameOrEmail: string,
  password: string,
  deviceName: string,
): Promise<LoginResponse> {
  return apiPost<{ usernameOrEmail: string; password: string; deviceName: string }, LoginResponse>(
    '/auth/login',
    {
      usernameOrEmail,
      password,
      deviceName,
    },
  );
}

export async function authLoginBegin(
  usernameOrEmail?: string,
): Promise<{ options: unknown; sessionID: string }> {
  return apiPost<{ usernameOrEmail?: string }, { options: unknown; sessionID: string }>(
    '/auth/login/begin',
    { usernameOrEmail },
  );
}

export async function authLoginFinish(
  sessionID: string,
  credential: unknown,
  deviceName: string,
): Promise<LoginResponse> {
  return apiPost<{ sessionID: string; credential: unknown; deviceName: string }, LoginResponse>(
    '/auth/login/finish',
    {
      sessionID,
      credential,
      deviceName,
    },
  );
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

// Settings API functions (replaces /auth/passkeys/* and /auth/api-keys/*)

export async function settingsListPasskeys(): Promise<PasskeyInfo[]> {
  return apiFetch<PasskeyInfo[]>('/settings/passkeys');
}

export async function settingsAddPasskeyBegin(): Promise<{ options: unknown; sessionID: string }> {
  return apiPost<Record<string, never>, { options: unknown; sessionID: string }>(
    '/settings/passkeys/begin',
    {},
  );
}

export async function settingsAddPasskeyFinish(
  sessionID: string,
  credential: unknown,
  name: string,
): Promise<PasskeyInfo> {
  return apiPost<{ sessionID: string; credential: unknown; name: string }, PasskeyInfo>(
    '/settings/passkeys/finish',
    { sessionID, credential, name },
  );
}

export async function settingsDeletePasskey(id: string): Promise<void> {
  return apiDelete(`/settings/passkeys/${encodeURIComponent(id)}`);
}

export async function settingsListAPIKeys(): Promise<APIKeyInfo[]> {
  return apiFetch<APIKeyInfo[]>('/settings/api-keys');
}

export async function settingsCreateAPIKey(
  name: string,
  expiresAt?: number,
): Promise<CreateAPIKeyResponse> {
  return apiPost<{ name: string; expiresAt?: number }, CreateAPIKeyResponse>('/settings/api-keys', {
    name,
    expiresAt,
  });
}

export async function settingsRevokeAPIKey(id: string): Promise<void> {
  return apiDelete(`/settings/api-keys/${encodeURIComponent(id)}`);
}

export interface SessionInfo {
  familyID: string;
  deviceName: string;
  sessionCreatedAt: number;
  lastRefreshedAt: number | null;
  expiresAt: number;
}

export async function settingsListSessions(): Promise<SessionInfo[]> {
  return apiFetch<SessionInfo[]>('/settings/sessions');
}

export async function settingsRevokeSession(familyId: string): Promise<void> {
  return apiDelete(`/settings/sessions/${encodeURIComponent(familyId)}`);
}

export async function settingsUpdateProfile(data: { displayName?: string }): Promise<AuthUser> {
  return apiPut<{ displayName?: string }, AuthUser>('/settings/profile', data);
}

export async function settingsRevokeSessions(): Promise<void> {
  const res = await fetchWithRefresh(`${API_BASE}/settings/revoke-sessions`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) {
    if (res.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    throw new Error(`HTTP ${res.status}`);
  }
}

// Admin API functions

export async function adminListUsers(): Promise<AdminUserListItem[]> {
  return apiFetch<AdminUserListItem[]>('/admin/users');
}

export async function adminCreateUser(
  username: string,
  displayName: string,
  email: string,
  isAdmin: boolean,
): Promise<AdminCreateUserResponse> {
  return apiPost<
    { username: string; displayName: string; email: string; isAdmin: boolean },
    AdminCreateUserResponse
  >('/admin/users', {
    username,
    displayName,
    email,
    isAdmin,
  });
}

export async function adminUpdateUser(
  id: string,
  data: { username?: string; displayName?: string; email?: string; isAdmin?: boolean },
): Promise<AdminUserListItem> {
  return apiPut<
    { username?: string; displayName?: string; email?: string; isAdmin?: boolean },
    AdminUserListItem
  >(`/admin/users/${encodeURIComponent(id)}`, data);
}

export async function adminDeleteUser(id: string): Promise<void> {
  return apiDelete(`/admin/users/${encodeURIComponent(id)}`);
}

export async function adminGetUser(id: string): Promise<AdminUserDetail> {
  return apiFetch<AdminUserDetail>(`/admin/users/${encodeURIComponent(id)}`);
}

export async function adminDeleteUserPasskey(userId: string, passkeyId: string): Promise<void> {
  return apiDelete(
    `/admin/users/${encodeURIComponent(userId)}/passkeys/${encodeURIComponent(passkeyId)}`,
  );
}

export async function adminDeleteUserAPIKey(userId: string, keyId: string): Promise<void> {
  return apiDelete(
    `/admin/users/${encodeURIComponent(userId)}/api-keys/${encodeURIComponent(keyId)}`,
  );
}

export async function adminCreateUserAPIKey(
  userId: string,
  ttlHours?: number,
): Promise<AdminTempAPIKeyResponse> {
  return apiPost<{ ttlHours?: number }, AdminTempAPIKeyResponse>(
    `/admin/users/${encodeURIComponent(userId)}/api-keys`,
    ttlHours !== undefined ? { ttlHours } : {},
  );
}

export async function adminRevokeUserSessions(userId: string): Promise<void> {
  const res = await fetchWithRefresh(
    `${API_BASE}/admin/users/${encodeURIComponent(userId)}/revoke-sessions`,
    {
      method: 'POST',
      credentials: 'include',
    },
  );
  if (!res.ok) {
    if (res.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    throw new Error(`HTTP ${res.status}`);
  }
}
