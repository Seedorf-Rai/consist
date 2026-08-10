import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Btn, Card, ErrorBanner, Header, Input, Shell } from "../components/ui";
import { TopBar } from "../components/TopBar";
import { C } from "../theme";
import { ApiError } from "../lib/api";
import { useJoinGroup } from "../queries/groups";

export function JoinGroupScreen() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const joinGroup = useJoinGroup();

  const submit = async () => {
    setError(null);
    try {
      // NOTE: POST /groups/:id/join expects a group id in the path, but the "join
      // by exact name" flow only gives the user a name. See README "Known API gap"
      // for the two ways to resolve this server-side. Until then we pass the name
      // itself as the path param as a best-effort lookup key.
      const res = await joinGroup.mutateAsync({ name: name.trim(), password: password.trim() });
      navigate(`/groups/${res.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not join the group.");
    }
  };

  return (
    <Shell>
      <TopBar />
      <Header title="Join a Group" onBack={() => navigate("/")} />
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
        <Btn variant="gold" full disabled={!name.trim() || !password.trim()} loading={joinGroup.isPending} onClick={submit}>
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
