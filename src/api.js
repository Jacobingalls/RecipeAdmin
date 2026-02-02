// Runtime config (Docker) or build-time config (local dev)
const getApiBase = () => {
    if (typeof window !== 'undefined' &&
        window.__RUNTIME_CONFIG__?.API_BASE_URL &&
        window.__RUNTIME_CONFIG__.API_BASE_URL !== '__API_BASE_URL__') {
        return window.__RUNTIME_CONFIG__.API_BASE_URL;
    }
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
};

const getApiDisplayUrl = () => {
    if (typeof window !== 'undefined' &&
        window.__RUNTIME_CONFIG__?.API_DISPLAY_URL &&
        window.__RUNTIME_CONFIG__.API_DISPLAY_URL !== '__API_DISPLAY_URL__') {
        return window.__RUNTIME_CONFIG__.API_DISPLAY_URL;
    }
    return getApiBase();
};

export const API_BASE = getApiBase();
export const API_DISPLAY_URL = getApiDisplayUrl();

async function apiFetch(endpoint) {
    const res = await fetch(`${API_BASE}${endpoint}`);
    if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
    }
    return res.json();
}

export async function lookupBarcode(barcode) {
    return apiFetch(`/lookup/${encodeURIComponent(barcode)}`);
}

export async function listProducts() {
    return apiFetch('/products');
}

export async function getProduct(id) {
    return apiFetch(`/products/${encodeURIComponent(id)}`);
}

export async function listGroups() {
    return apiFetch('/groups');
}

export async function getGroup(id) {
    return apiFetch(`/groups/${encodeURIComponent(id)}`);
}
