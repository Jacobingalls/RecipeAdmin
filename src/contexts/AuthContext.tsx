import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { startAuthentication } from '@simplewebauthn/browser';

import type { AuthUser } from '../api';
import {
  getStatus,
  authLogin,
  authLoginBegin,
  authLoginFinish,
  authLogout,
  tryRefresh,
} from '../api';

interface AuthContextValue {
  isAuthenticated: boolean;
  user: AuthUser | null;
  isLoading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  loginWithPasskey: (usernameOrEmail?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: AuthUser) => void;
  refreshSession: () => Promise<void>;
}

export function getDeviceName(): string {
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return 'iPhone';
  if (/iPad/.test(ua)) return 'iPad';
  if (/Android/.test(ua)) return 'Android';

  let browser: string | null = null;
  if (/Edg\//.test(ua)) browser = 'Edge';
  else if (/Chrome\//.test(ua)) browser = 'Chrome';
  else if (/Firefox\//.test(ua)) browser = 'Firefox';
  else if (/Safari\//.test(ua)) browser = 'Safari';

  let platform: string | null = null;
  if (/Macintosh/.test(ua)) platform = 'Mac';
  else if (/Windows/.test(ua)) platform = 'Windows';
  else if (/Linux/.test(ua)) platform = 'Linux';

  if (browser && platform) return `${browser} on ${platform}`;
  return browser ?? platform ?? 'Unknown device';
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const status = await getStatus();
      setUser(status.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setIsLoading(false);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = useCallback(async (usernameOrEmail: string, password: string) => {
    const deviceName = getDeviceName();
    const response = await authLogin(usernameOrEmail, password, deviceName);
    setUser(response.user);
  }, []);

  const loginWithPasskey = useCallback(async (usernameOrEmail?: string) => {
    const { options, sessionID } = await authLoginBegin(usernameOrEmail);
    const credential = await startAuthentication({ optionsJSON: options });
    const deviceName = getDeviceName();
    const response = await authLoginFinish(sessionID, credential, deviceName);
    setUser(response.user);
  }, []);

  const logoutFn = useCallback(async () => {
    await authLogout();
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser: AuthUser) => {
    setUser(updatedUser);
  }, []);

  const refreshSession = useCallback(async () => {
    await tryRefresh();
    const status = await getStatus();
    setUser(status.user ?? null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: user !== null,
        user,
        isLoading,
        login,
        loginWithPasskey,
        logout: logoutFn,
        updateUser,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
