import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Camera, Check, X } from "lucide-react";
import { Btn, Card, CenteredNote, ErrorBanner, Header, Shell, Spinner } from "../components/ui";
import { TopBar } from "../components/TopBar";
import { C } from "../theme";
import { ApiError } from "../lib/api";
import { usePendingValidations, useScreenshotUrl, useValidateTask } from "../queries/tasks";
import { useFlash } from "../routes/RootLayout";

export function ValidateScreen() {
  const { groupId = "" } = useParams();
  const navigate = useNavigate();
  const flash = useFlash();

  const { data: pending, error, isLoading } = usePendingValidations(groupId);
  const validateTask = useValidateTask(groupId);

  const decide = async (taskId: string, decision: "approve" | "reject") => {
    try {
      await validateTask.mutateAsync({ taskId, decision });
      flash(decision === "approve" ? "Task approved." : "Task rejected.", decision === "approve" ? "ok" : "error");
    } catch (err) {
      flash(err instanceof ApiError ? err.message : "Could not record your decision.", "error");
    }
  };

  return (
    <Shell>
      <TopBar />
      <Header title="Validate Tasks" onBack={() => navigate(`/groups/${groupId}`)} />

      {error && (
        <ErrorBanner message={error instanceof ApiError ? error.message : "Failed to load pending validations."} />
      )}
      {isLoading && !error && <Spinner label="Loading pending validations…" />}
      {pending && pending.length === 0 && <CenteredNote>Nothing waiting on you right now.</CenteredNote>}

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {pending?.map((p) => (
          <Card key={p.validation_id}>
            <div style={{ fontSize: 11, color: C.textFaint, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
              {p.owner.name}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{p.title}</div>
            {p.evidence && <EvidenceBlock taskId={p.task_id} description={p.evidence.description} />}
            <div style={{ display: "flex", gap: 8 }}>
              <Btn
                variant="green"
                loading={validateTask.isPending && validateTask.variables?.taskId === p.task_id}
                onClick={() => decide(p.task_id, "approve")}
              >
                <Check size={14} /> Approve
              </Btn>
              <Btn
                variant="red"
                loading={validateTask.isPending && validateTask.variables?.taskId === p.task_id}
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

function EvidenceBlock({ taskId, description }: { taskId: string; description: string }) {
  const { data: link, isError } = useScreenshotUrl(taskId, true);

  return (
    <div
      style={{
        fontSize: 12,
        color: C.textDim,
        background: C.bgHatch,
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
      }}
    >
      {link ? (
        <a href={link} target="_blank" rel="noreferrer" style={{ flexShrink: 0 }}>
          <img
            src={link}
            alt="Evidence"
            style={{
              width: 56,
              height: 56,
              objectFit: "cover",
              borderRadius: 6,
              border: `1px solid ${C.border}`,
              display: "block",
            }}
          />
        </a>
      ) : (
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 6,
            border: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Camera size={16} style={{ opacity: 0.4 }} />
        </div>
      )}
      <div>
        {isError && <div style={{ fontStyle: "italic", color: C.textFaint }}>Could not load evidence link</div>}
        {link && (
          <a href={link} target="_blank" rel="noreferrer" style={{ color: C.text, fontStyle: "italic" }}>
            View full size
          </a>
        )}
        <div style={{ marginTop: 3 }}>{description}</div>
      </div>
    </div>
  );
}
