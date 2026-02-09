import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { startAuthentication } from '@simplewebauthn/browser';

import type { AuthUser } from '../api';
import { authMe, authLogin, authLoginBegin, authLoginFinish, authLogout } from '../api';

interface AuthContextValue {
  isAuthenticated: boolean;
  user: AuthUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  loginWithPasskey: (username?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const me = await authMe();
      setUser(me);
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

  const login = useCallback(async (username: string, password: string) => {
    const response = await authLogin(username, password);
    setUser(response.user);
  }, []);

  const loginWithPasskey = useCallback(async (username?: string) => {
    const { options, sessionID } = await authLoginBegin(username);
    const credential = await startAuthentication({ optionsJSON: options });
    const response = await authLoginFinish(sessionID, credential);
    setUser(response.user);
  }, []);

  const logoutFn = useCallback(async () => {
    await authLogout();
    setUser(null);
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
