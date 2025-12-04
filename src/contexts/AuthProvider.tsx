import { useMemo, useEffect, useState, type ReactNode, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import type { Session } from '../types/auth';
import { setAuthToken } from '../api/axiosInstance';
import * as authService from '../services/auth.service';
import axios from 'axios';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const handleSetSession = (sessionData: Session | null) => {
    setSession(sessionData);
    setAuthToken(sessionData?.accessToken ?? null);
  };

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const initAuth = async () => {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          handleSetSession(null);
          return;
        }

        const { accessToken } = await authService.refreshToken(signal);
        setAuthToken(accessToken);


        const user = await authService.getUserInfo(signal);

        if (user && accessToken && !signal.aborted) {
          handleSetSession({ user, accessToken, refreshToken });
        }
      } catch (e) {
        if (axios.isCancel(e)) {
          console.log('Initial auth request cancelled.');
          return;
        }
        console.log('No active session or refresh failed.');
        if (!signal.aborted) {
          handleSetSession(null);
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };
    initAuth();

    return () => {
      controller.abort();
    };
  }, []);

  const login = useCallback(async (credentials: { usuario: string; password: string }) => {
    const sessionData = await authService.login(credentials);
    handleSetSession(sessionData);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    handleSetSession(null);
  }, []);

  const authContextValue = useMemo(
    () => ({
      session,
      loading,
      login,
      logout,
    }),
    [session, loading, login, logout]
  );

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
