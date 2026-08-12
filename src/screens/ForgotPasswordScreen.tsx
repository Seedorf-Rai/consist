import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Btn, Card, ErrorBanner, Input, Shell } from "../components/ui";
import { C, FONT_DISPLAY } from "../theme";
import { ApiError } from "../lib/api";
import { useForgotPassword, useResetPassword } from "../queries/auth";

export function ForgotPasswordScreen() {
  const navigate = useNavigate();
  const forgotPassword = useForgotPassword();
  const resetPassword = useResetPassword();

  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const requestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await forgotPassword.mutateAsync(email.trim());
      setInfo(res.message);
      setStep("reset");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    }
  };

  const submitReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await resetPassword.mutateAsync({ email: email.trim(), otp: otp.trim(), newPassword });
      navigate("/", { replace: true });
    } catch (err) {
      // "Too many incorrect attempts" (403) means the code is burned —
      // send them back to request a fresh one instead of letting them
      // keep retrying a dead OTP.
      if (err instanceof ApiError && err.status === 403) {
        setError(err.message);
        setStep("request");
        setOtp("");
      } else {
        setError(err instanceof ApiError ? err.message : "Something went wrong.");
      }
    }
  };

  return (
    <Shell>
      <div style={{ textAlign: "center", marginTop: 40, marginBottom: 36 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 32, fontWeight: 700, color: C.gold, letterSpacing: 1 }}>
          {step === "request" ? "Forgot Password" : "Reset Password"}
        </div>
        <div style={{ color: C.textDim, fontSize: 14, marginTop: 8 }}>
          {step === "request"
            ? "Enter your email and we'll send a reset code."
            : `Enter the code sent to ${email} and your new password.`}
        </div>
      </div>

      <Card>
        {error && <ErrorBanner message={error} />}
        {info && !error && step === "reset" && <ErrorBanner message={info} />}

        {step === "request" ? (
          <form onSubmit={requestCode}>
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Btn variant="gold" full type="submit" loading={forgotPassword.isPending} disabled={forgotPassword.isPending}>
              Send Reset Code <ArrowRight size={14} />
            </Btn>
          </form>
        ) : (
          <form onSubmit={submitReset}>
            <Input
              label="Reset code"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              maxLength={6}
              required
            />
            <Input
              label="New password"
              type="password"
              placeholder="At least 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Btn
              variant="gold"
              full
              type="submit"
              loading={resetPassword.isPending}
              disabled={resetPassword.isPending || otp.length !== 6 || newPassword.length < 8}
            >
              Reset Password <ArrowRight size={14} />
            </Btn>
          </form>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
          {step === "reset" && (
            <Btn variant="ghost" onClick={() => setStep("request")}>
              Use a different email
            </Btn>
          )}
          <Btn variant="ghost" onClick={() => navigate("/login")} style={{ marginLeft: "auto" }}>
            Back to login
          </Btn>
        </div>
      </Card>
    </Shell>
  );
}