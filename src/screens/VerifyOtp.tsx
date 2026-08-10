import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Btn, Card, ErrorBanner, Input, Shell } from "../components/ui";
import { C, FONT_DISPLAY } from "../theme";
import { useAuth } from "../context/AuthContext";

export function VerifyOtpScreen() {
  const { pendingVerificationEmail, verifyOtp, resendOtp, cancelVerification } = useAuth();
  // PublicOnly guards this route so pendingVerificationEmail is always set
  // by the time we render — the fallback just keeps TypeScript happy.
  const email = pendingVerificationEmail ?? "";
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await verifyOtp(email, otp.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setResendMessage(null);
    setResending(true);
    try {
      await resendOtp(email);
      setResendMessage("A new code has been sent.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <Shell>
      <div style={{ textAlign: "center", marginTop: 40, marginBottom: 36 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 32, fontWeight: 700, color: C.gold, letterSpacing: 1 }}>
          Verify your email
        </div>
        <div style={{ color: C.textDim, fontSize: 14, marginTop: 8 }}>
          We sent a 6-digit code to <b>{email}</b>
        </div>
      </div>
      <Card>
        {error && <ErrorBanner message={error} />}
        {resendMessage && !error && <ErrorBanner message={resendMessage} />}

        <form onSubmit={submit}>
          <Input
            label="Verification code"
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            maxLength={6}
            required
          />
          <Btn variant="gold" full type="submit" loading={submitting} disabled={submitting || otp.length !== 6}>
            Verify <ArrowRight size={14} />
          </Btn>
        </form>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
          <Btn variant="ghost" onClick={handleResend} disabled={resending}>
            {resending ? "Resending…" : "Resend code"}
          </Btn>
          <Btn variant="ghost" onClick={cancelVerification}>
            Back
          </Btn>
        </div>
      </Card>
    </Shell>
  );
}
