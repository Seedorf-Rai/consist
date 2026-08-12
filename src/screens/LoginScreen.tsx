import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Btn, Card, ErrorBanner, Input, Shell } from "../components/ui";
import { C, FONT_DISPLAY } from "../theme";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export function LoginScreen() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email.trim(), password);
      } else {
        await signup(name.trim(), email.trim(), password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Shell>
      <div style={{ textAlign: "center", marginTop: 40, marginBottom: 36 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 40, fontWeight: 700, color: C.gold, letterSpacing: 1 }}>
          THE PACT
        </div>
        <div style={{ color: C.textDim, fontSize: 14, marginTop: 8 }}>Put money where your streak is.</div>
      </div>
      <Card>
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          <Btn variant={mode === "login" ? "gold" : "ghost"} full onClick={() => setMode("login")}>
            Log in
          </Btn>
          <Btn variant={mode === "signup" ? "gold" : "ghost"} full onClick={() => setMode("signup")}>
            Sign up
          </Btn>
        </div>

        {error && <ErrorBanner message={error} />}

        <form onSubmit={submit}>
          {mode === "signup" && (
            <Input label="Name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
          )}
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {mode === "login" && (
            <div style={{ textAlign: "right", marginTop: -8, marginBottom: 14 }}>
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                style={{ background: "none", border: "none", color: C.textDim, fontSize: 12, cursor: "pointer", padding: 0 }}
              >
                Forgot password?
              </button>
            </div>
          )}
          <Btn variant="gold" full type="submit" loading={submitting} disabled={submitting}>
            {mode === "login" ? "Log in" : "Create account"} <ArrowRight size={14} />
          </Btn>
        </form>
      </Card>
    </Shell>
  );
}
