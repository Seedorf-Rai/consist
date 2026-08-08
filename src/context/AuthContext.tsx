import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, ApiError, getToken, setToken } from "../lib/api";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  initializing: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setInitializing(false);
      return;
    }
    api.auth
      .me()
      .then((me) => setUser(me))
      .catch(() => setToken(null))
      .finally(() => setInitializing(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const res = await api.auth.login(email, password);
      setToken(res.token);
      setUser(res.user);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed.");
      throw err;
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    setError(null);
    try {
      const res = await api.auth.signup(name, email, password);
      setToken(res.token);
      setUser(res.user);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Sign up failed.");
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    api.auth.logout().catch(() => {});
    setToken(null);
    setUser(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{ user, initializing, error, login, signup, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
