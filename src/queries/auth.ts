import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError, getToken, setToken } from "../lib/api";
import { qk } from "./keys";

/** Current user, driven off whatever token is in localStorage. */
export function useMe() {
  return useQuery({
    queryKey: qk.me(),
    queryFn: api.auth.me,
    enabled: !!getToken(),
    retry: false,
    staleTime: 60_000,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => api.auth.login(email, password),
    onSuccess: (res) => {
      setToken(res.token);
      qc.setQueryData(qk.me(), res.user);
    },
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: ({ name, email, password }: { name: string; email: string; password: string }) =>
      api.auth.signup(name, email, password),
  });
}

export function useVerifyOtp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) => api.auth.verifyEmail(email, otp),
    onSuccess: (res) => {
      setToken(res.token);
      qc.setQueryData(qk.me(), res.user);
    },
  });
}

export function useResendOtp() {
  return useMutation({
    mutationFn: (email: string) => api.auth.resendOtp(email),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.auth.logout().catch(() => {}),
    onSettled: () => {
      setToken(null);
      qc.setQueryData(qk.me(), null);
      qc.clear();
    },
  });
}
export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => api.auth.forgotPassword(email),
  });
}

export function useResetPassword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ email, otp, newPassword }: { email: string; otp: string; newPassword: string }) =>
      api.auth.resetPassword(email, otp, newPassword),
    onSuccess: (res) => {
      setToken(res.token);
      qc.setQueryData(qk.me(), res.user);
    },
  });
}

export { ApiError };
