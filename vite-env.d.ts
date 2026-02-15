/// <reference types="vite/client" />

interface RuntimeConfig {
  API_BASE_URL?: string;
  API_DISPLAY_URL?: string;
  VERSION?: string;
  GIT_COMMIT?: string;
}

declare global {
  interface Window {
    __RUNTIME_CONFIG__?: RuntimeConfig;
  }
}

export {};
