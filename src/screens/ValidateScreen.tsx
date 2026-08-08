import React, { useCallback, useEffect, useState } from "react";
import { Camera, Check, X } from "lucide-react";
import { Btn, Card, CenteredNote, ErrorBanner, Header, Shell, Spinner } from "../components/ui";
import { TopBar } from "../components/TopBar";
import { C } from "../theme";
import { api, ApiError } from "../lib/api";
import type { PendingValidation } from "../types";

export function ValidateScreen({
  groupId,
  onBack,
  flash,
}: {
  groupId: string;
  onBack: () => void;
  flash: (msg: string, type?: "ok" | "error") => void;
}) {
  const [pending, setPending] = useState<PendingValidation[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [decidingId, setDecidingId] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    api.tasks
      .pendingValidations(groupId)
      .then(setPending)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load pending validations."));
  }, [groupId]);

  useEffect(() => {
    load();
  }, [load]);

  const decide = async (taskId: string, decision: "approve" | "reject") => {
    setDecidingId(taskId);
    try {
      await api.tasks.validate(taskId, decision);
      flash(decision === "approve" ? "Task approved." : "Task rejected.", decision === "approve" ? "ok" : "error");
      load();
    } catch (err) {
      flash(err instanceof ApiError ? err.message : "Could not record your decision.", "error");
    } finally {
      setDecidingId(null);
    }
  };

  return (
    <Shell>
      <TopBar />
      <Header title="Validate Tasks" onBack={onBack} />

      {error && <ErrorBanner message={error} />}
      {!pending && !error && <Spinner label="Loading pending validations…" />}
      {pending && pending.length === 0 && <CenteredNote>Nothing waiting on you right now.</CenteredNote>}

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {pending?.map((p) => (
          <Card key={p.validation_id}>
            <div style={{ fontSize: 11, color: C.textFaint, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
              {p.owner.name}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{p.title}</div>
            {p.evidence && (
              <div
                style={{
                  fontSize: 12,
                  color: C.textDim,
                  background: C.bgHatch,
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 10,
                  display: "flex",
                  gap: 8,
                  alignItems: "flex-start",
                }}
              >
                <Camera size={13} style={{ marginTop: 1, flexShrink: 0 }} />
                <div>
                  <div style={{ fontStyle: "italic", wordBreak: "break-all" }}>{p.evidence.screenshot_url}</div>
                  <div style={{ marginTop: 3 }}>{p.evidence.description}</div>
                </div>
              </div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <Btn
                variant="green"
                loading={decidingId === p.task_id}
                onClick={() => decide(p.task_id, "approve")}
              >
                <Check size={14} /> Approve
              </Btn>
              <Btn
                variant="red"
                loading={decidingId === p.task_id}
                onClick={() => decide(p.task_id, "reject")}
              >
                <X size={14} /> Reject
              </Btn>
            </div>
          </Card>
        ))}
      </div>
    </Shell>
  );
}
