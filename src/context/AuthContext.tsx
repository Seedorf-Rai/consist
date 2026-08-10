import React, { createContext, useCallback, useContext, useState } from "react";
import { useLogin, useLogout, useMe, useResendOtp, useSignup, useVerifyOtp } from "../queries/auth";
import { ApiError, getToken } from "../lib/api";
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
  const meQuery = useMe();
  const loginMutation = useLogin();
  const signupMutation = useSignup();
  const verifyMutation = useVerifyOtp();
  const resendMutation = useResendOtp();
  const logoutMutation = useLogout();

  const [error, setError] = useState<string | null>(null);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);

  const login = useCallback(
    async (email: string, password: string) => {
      setError(null);
      try {
        await loginMutation.mutateAsync({ email, password });
      } catch (err) {
        // Backend returns 403 "Please verify your email before logging in." for
        // unverified accounts — send them to the OTP screen instead of a generic error.
        if (err instanceof ApiError && err.status === 403) {
          setPendingVerificationEmail(email);
        }
        setError(err instanceof ApiError ? err.message : "Login failed.");
        throw err;
      }
    },
    [loginMutation]
  );

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      setError(null);
      try {
        const res = await signupMutation.mutateAsync({ name, email, password });
        setPendingVerificationEmail(res.email);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Sign up failed.");
        throw err;
      }
    },
    [signupMutation]
  );

  const verifyOtp = useCallback(
    async (email: string, otp: string) => {
      setError(null);
      try {
        await verifyMutation.mutateAsync({ email, otp });
        setPendingVerificationEmail(null);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Verification failed.");
        throw err;
      }
    },
    [verifyMutation]
  );

  const resendOtp = useCallback(
    async (email: string) => {
      setError(null);
      try {
        await resendMutation.mutateAsync(email);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Could not resend code.");
        throw err;
      }
    },
    [resendMutation]
  );

  const cancelVerification = useCallback(() => {
    setPendingVerificationEmail(null);
    setError(null);
  }, []);

  const logout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  const clearError = useCallback(() => setError(null), []);

  // "initializing" only applies while we're checking a token that's already
  // sitting in localStorage — no token means there's nothing to check.
  const initializing = !!getToken() && meQuery.isLoading;

  return (
    <AuthContext.Provider
      value={{
        user: meQuery.data ?? null,
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
