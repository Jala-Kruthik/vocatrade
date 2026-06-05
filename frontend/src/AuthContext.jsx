import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// ── Axios instance ─────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Helpers ────────────────────────────────────────────────────────────────────
/**
 * Minimal JWT decoder — splits the payload segment and base64-decodes it.
 * Falls back to null on any error so callers can handle gracefully.
 */
function decodeJWT(token) {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;
  return decoded.exp * 1000 < Date.now();
}

// ── Context ────────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    delete api.defaults.headers.common['Authorization'];
  }, []);

  // ── Axios request interceptor — attach token ────────────────────────────────
  useEffect(() => {
    const reqId = api.interceptors.request.use((config) => {
      const stored = localStorage.getItem('token');
      if (stored) config.headers.Authorization = `Bearer ${stored}`;
      return config;
    });

    const resId = api.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 401) {
          logout();
        }
        return Promise.reject(err);
      }
    );

    return () => {
      api.interceptors.request.eject(reqId);
      api.interceptors.response.eject(resId);
    };
  }, [logout]);

  // ── Restore session on mount ────────────────────────────────────────────────
  useEffect(() => {
    const restore = async () => {
      const stored = localStorage.getItem('token');
      if (!stored || isTokenExpired(stored)) {
        logout();
        setLoading(false);
        return;
      }

      try {
        api.defaults.headers.common['Authorization'] = `Bearer ${stored}`;
        const { data } = await api.get('/auth/me');
        setToken(stored);
        setUser(data.user ?? data);
        setIsAuthenticated(true);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    restore();
  }, [logout]);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = async (email, password, remember = false) => {
    const { data } = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = data;

    if (remember) {
      localStorage.setItem('token', newToken);
    } else {
      // Still store — session persists until explicit logout or expiry
      localStorage.setItem('token', newToken);
    }

    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(userData);
    setIsAuthenticated(true);
    return userData;
  };

  // ── Register ───────────────────────────────────────────────────────────────
  const register = async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    const { token: newToken, user: userData } = data;

    localStorage.setItem('token', newToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(userData);
    setIsAuthenticated(true);
    return userData;
  };

  // ── Refresh current user ──────────────────────────────────────────────────
  const refreshUser = async () => {
    const { data } = await api.get('/auth/me');
    const userData = data.user ?? data;
    setUser(userData);
    setIsAuthenticated(true);
    return userData;
  };

  // ── getCurrentUser ─────────────────────────────────────────────────────────
  const getCurrentUser = () => user;

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    register,
    refreshUser,
    logout,
    getCurrentUser,
    api, // expose the configured axios instance
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export { api };
export default AuthContext;
