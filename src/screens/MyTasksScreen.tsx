import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Camera, Plus } from "lucide-react";
import {
  Btn,
  Card,
  CenteredNote,
  ErrorBanner,
  Header,
  Shell,
  Spinner,
  StatusChip,
} from "../components/ui";
import { TopBar } from "../components/TopBar";
import { C, FONT_BODY } from "../theme";
import { ApiError } from "../lib/api";
import { useCreateTask, useMyTasks, useScreenshotUrl, useSubmitTask } from "../queries/tasks";
import { useFlash } from "../routes/RootLayout";
import type { BoardStatus, Task } from "../types";

function toBoardStatus(t: Task): BoardStatus {
  if (t.status === "draft") return "in_progress";
  if (t.status === "submitted") return "awaiting_validation";
  return t.status;
}

export function MyTasksScreen() {
  const { groupId = "" } = useParams();
  const navigate = useNavigate();
  const flash = useFlash();

  const { data: tasks, error, isLoading } = useMyTasks(groupId);
  const [title, setTitle] = useState("");
  const createTask = useCreateTask(groupId);

  const addTask = async () => {
    if (!title.trim()) return;
    try {
      await createTask.mutateAsync(title.trim());
      setTitle("");
    } catch (err) {
      flash(err instanceof ApiError ? err.message : "Could not add the task.", "error");
    }
  };

  return (
    <Shell>
      <TopBar />
      <Header title="My Tasks — Today" onBack={() => navigate(`/groups/${groupId}`)} />

      {error && (
        <ErrorBanner message={error instanceof ApiError ? error.message : "Failed to load your tasks."} />
      )}

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            placeholder="e.g. Solve 3 LeetCode problems"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            style={{
              flex: 1,
              background: C.bgHatch,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              padding: "10px 12px",
              color: C.text,
              fontSize: 14,
              fontFamily: FONT_BODY,
            }}
          />
          <Btn variant="gold" disabled={!title.trim()} loading={createTask.isPending} onClick={addTask}>
            <Plus size={14} /> Add
          </Btn>
        </div>
      </Card>

      {isLoading && !error && <Spinner />}
      {tasks && tasks.length === 0 && (
        <CenteredNote>No tasks yet — add at least one to be in today's pact.</CenteredNote>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {tasks?.map((t) => (
          <TaskRow key={t.id} task={t} flash={flash} />
        ))}
      </div>
    </Shell>
  );
}

function TaskRow({
  task,
  flash,
}: {
  task: Task;
  flash: (msg: string, type?: "ok" | "error") => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [desc, setDesc] = useState("");
  const [open, setOpen] = useState(false);
  const approvedCount = task.validations.filter((v) => v.decision === "approved").length;
  const canSubmit = task.status === "draft" || task.status === "rejected";
  const wantsLink = task.status === "submitted" || task.status === "approved" || task.status === "rejected";

  const { data: link } = useScreenshotUrl(task.id, wantsLink);
  const submitTask = useSubmitTask(task.group_id);

  const submit = async () => {
    if (!file) return;
    try {
      await submitTask.mutateAsync({ taskId: task.id, file, description: desc.trim() });
      setOpen(false);
      setFile(null);
      setDesc("");
    } catch (err) {
      flash(err instanceof ApiError ? err.message : "Could not submit evidence.", "error");
    }
  };

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{task.title}</div>
        <StatusChip status={toBoardStatus(task)} />
      </div>

      {task.status === "submitted" && (
        <div style={{ fontSize: 11, color: C.textFaint, marginTop: 6 }}>
          {approvedCount}/{task.validations.length} approved
          {link && (
            <>
              {" · "}
              <a href={link} target="_blank" rel="noreferrer" style={{ color: C.text }}>
                View evidence
              </a>
            </>
          )}
        </div>
      )}

      {task.status === "rejected" && !open && (
        <div style={{ marginTop: 6 }}>
          <div style={{ fontSize: 11, color: C.textFaint }}>
            This task was rejected.
            {link && (
              <>
                {" · "}
                <a href={link} target="_blank" rel="noreferrer" style={{ color: C.text }}>
                  View previous evidence
                </a>
              </>
            )}
          </div>
        </div>
      )}

      {canSubmit && (
        <div style={{ marginTop: 10 }}>
          {!open ? (
            <Btn variant="gold" onClick={() => setOpen(true)}>
              <Camera size={13} /> {task.status === "rejected" ? "Resubmit evidence" : "Submit evidence"}
            </Btn>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                style={{
                  background: C.bgHatch,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  padding: "9px 11px",
                  color: C.text,
                  fontSize: 13,
                  fontFamily: FONT_BODY,
                }}
              />
              <textarea
                placeholder="Short description of what you did"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={2}
                style={{
                  background: C.bgHatch,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  padding: "9px 11px",
                  color: C.text,
                  fontSize: 13,
                  fontFamily: FONT_BODY,
                  resize: "vertical",
                }}
              />
              <Btn variant="gold" disabled={!file || !desc.trim()} loading={submitTask.isPending} onClick={submit}>
                {task.status === "rejected" ? "Resubmit for validation" : "Submit for validation"}
              </Btn>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
