import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, ApiError, getToken, setToken } from "../lib/api";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  initializing: boolean;
  error: string | null;
  pendingVerificationEmail: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  cancelVerification: () => void;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);

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
      // Backend returns 403 "Please verify your email before logging in." for unverified accounts —
      // send them to the OTP screen instead of just showing a generic error.
      if (err instanceof ApiError && err.status === 403) {
        setPendingVerificationEmail(email);
      }
      setError(err instanceof ApiError ? err.message : "Login failed.");
      throw err;
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    setError(null);
    try {
      const res = await api.auth.signup(name, email, password);
      setPendingVerificationEmail(res.email);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Sign up failed.");
      throw err;
    }
  }, []);

  const verifyOtp = useCallback(async (email: string, otp: string) => {
    setError(null);
    try {
      const res = await api.auth.verifyEmail(email, otp);
      setToken(res.token);
      setUser(res.user);
      setPendingVerificationEmail(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Verification failed.");
      throw err;
    }
  }, []);

  const resendOtp = useCallback(async (email: string) => {
    setError(null);
    try {
      await api.auth.resendOtp(email);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not resend code.");
      throw err;
    }
  }, []);

  const cancelVerification = useCallback(() => {
    setPendingVerificationEmail(null);
    setError(null);
  }, []);

  const logout = useCallback(() => {
    api.auth.logout().catch(() => {});
    setToken(null);
    setUser(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        initializing,
        error,
        pendingVerificationEmail,
        login,
        signup,
        verifyOtp,
        resendOtp,
        cancelVerification,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}