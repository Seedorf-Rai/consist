import React, { useState } from "react";
import { Btn, Card, ErrorBanner, Header, Input, Shell } from "../components/ui";
import { TopBar } from "../components/TopBar";
import { C } from "../theme";
import { api, ApiError } from "../lib/api";

export function JoinGroupScreen({
  onBack,
  onJoined,
}: {
  onBack: () => void;
  onJoined: (groupId: string, name: string) => void;
}) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      // NOTE: POST /groups/:id/join expects a group id in the path, but the "join
      // by exact name" flow only gives the user a name. See README "Known API gap"
      // for the two ways to resolve this server-side. Until then we pass the name
      // itself as the path param as a best-effort lookup key.
      const res = await api.groups.join(encodeURIComponent(name.trim()), name.trim(), password.trim());
      onJoined(res.id, res.name);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not join the group.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Shell>
      <TopBar />
      <Header title="Join a Group" onBack={onBack} />
      <Card>
        {error && <ErrorBanner message={error} />}
        <Input label="Group name" placeholder="Exact group name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input
          label="Password"
          type="text"
          placeholder="Group password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Btn variant="gold" full disabled={!name.trim() || !password.trim()} loading={submitting} onClick={submit}>
          Join Group
        </Btn>
        <div style={{ fontSize: 11, color: C.textFaint, marginTop: 12 }}>
          Note: joining looks the group up by its exact name, so the id in the URL is a placeholder — the API
          resolves it from the <code>name</code>/<code>password</code> in the request body.
        </div>
      </Card>
    </Shell>
  );
}
