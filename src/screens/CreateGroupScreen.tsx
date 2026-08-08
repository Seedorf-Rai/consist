import React, { useState } from "react";
import { Btn, Card, ErrorBanner, Header, Input, Shell } from "../components/ui";
import { TopBar } from "../components/TopBar";
import { C, FONT_BODY, FONT_MONO } from "../theme";
import { api, ApiError } from "../lib/api";

const STAKES = [100, 200, 500];

export function CreateGroupScreen({
  onBack,
  onCreated,
}: {
  onBack: () => void;
  onCreated: (groupId: string, name: string) => void;
}) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [stake, setStake] = useState(100);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await api.groups.create(name.trim(), password.trim(), stake);
      onCreated(res.id, res.name);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create the group.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Shell>
      <TopBar />
      <Header title="Create a Group" onBack={onBack} />
      <Card>
        {error && <ErrorBanner message={error} />}
        <Input label="Group name" placeholder="e.g. Grind Squad" value={name} onChange={(e) => setName(e.target.value)} />
        <Input
          label="Group password"
          placeholder="Others need this to join"
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div style={{ marginBottom: 18 }}>
          <div
            style={{
              fontFamily: FONT_BODY,
              fontSize: 12,
              fontWeight: 600,
              color: C.textDim,
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Daily stake
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {STAKES.map((v) => (
              <button
                key={v}
                onClick={() => setStake(v)}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 8,
                  border: `1px solid ${stake === v ? C.gold : C.border}`,
                  background: stake === v ? "rgba(201,169,97,0.12)" : C.bgHatch,
                  color: stake === v ? C.gold : C.text,
                  fontFamily: FONT_MONO,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ₹{v}
              </button>
            ))}
          </div>
        </div>
        <Btn
          variant="gold"
          full
          disabled={!name.trim() || !password.trim()}
          loading={submitting}
          onClick={submit}
        >
          Create Group & Become Admin
        </Btn>
      </Card>
    </Shell>
  );
}
