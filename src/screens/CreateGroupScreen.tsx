import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Btn, Card, ErrorBanner, Header, Input, Shell } from "../components/ui";
import { TopBar } from "../components/TopBar";
import { C, FONT_BODY, FONT_MONO } from "../theme";
import { ApiError } from "../lib/api";
import { useCreateGroup } from "../queries/groups";

const STAKES = [100, 200, 500];

export function CreateGroupScreen() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [stake, setStake] = useState(100);
  const [error, setError] = useState<string | null>(null);
  const createGroup = useCreateGroup();

  const submit = async () => {
    setError(null);
    try {
      const res = await createGroup.mutateAsync({ name: name.trim(), password: password.trim(), dailyStake: stake });
      navigate(`/groups/${res.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create the group.");
    }
  };

  return (
    <Shell>
      <TopBar />
      <Header title="Create a Group" onBack={() => navigate("/")} />
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
          loading={createGroup.isPending}
          onClick={submit}
        >
          Create Group & Become Admin
        </Btn>
      </Card>
    </Shell>
  );
}
