import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Btn, Card, ErrorBanner, Header, Shell, Spinner, StatusChip } from "../components/ui";
import { TopBar } from "../components/TopBar";
import { C } from "../theme";
import { ApiError } from "../lib/api";
import { usePerUserTasks } from "../queries/tasks";
import { useGroupMembers } from "../queries/groups";
import type { PerUserTask } from "../types";

const DAY_MS = 24 * 60 * 60 * 1000;

function missedLabel(task: PerUserTask, createdAt?: string): string | null {
  if (!createdAt) return null;
  const ageMs = Date.now() - new Date(createdAt).getTime();
  if (ageMs < DAY_MS) return null;
  if (task.status === "draft") return "Completion missed";
  if (task.status === "submitted") return "Validation missed";
  return null;
}

export function MemberTasksScreen() {
  const { groupId = "", userId = "" } = useParams();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const { data: members } = useGroupMembers(groupId);
  const memberName = members?.find((m) => m.user_id === userId)?.name ?? "Member";

  const { data, error, isLoading, isFetching } = usePerUserTasks(groupId, userId, page);

  return (
    <Shell>
      <TopBar />
      <Header title={`${memberName}'s Tasks`} onBack={() => navigate(`/groups/${groupId}`)} />

      {error && (
        <ErrorBanner message={error instanceof ApiError ? error.message : "Failed to load tasks."} />
      )}
      {isLoading && !error && <Spinner label="Loading tasks…" />}

      {data && data.tasks.length === 0 && (
        <div style={{ fontSize: 12, color: C.textFaint, textAlign: "center", padding: "20px 0" }}>
          No tasks yet.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {data?.tasks.map((t) => {
          // Per-user task responses don't include createdAt, so the missed
          // flag falls back to the submission time when present; drafts with
          // no timestamp at all just show the normal status chip.
          const missed = missedLabel(t, t.submission?.submittedAt);
          const isOpen = !!expanded[t.id];
          return (
            <Card key={t.id} style={missed ? { borderColor: C.red } : undefined}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{t.title}</div>
                  <div style={{ fontSize: 11, color: C.textFaint, marginTop: 2 }}>{t.date}</div>
                </div>
                {missed ? (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: C.red,
                      border: `1px solid ${C.red}55`,
                      background: "rgba(205,92,92,0.12)",
                      borderRadius: 999,
                      padding: "4px 10px",
                    }}
                  >
                    {missed}
                  </span>
                ) : (
                  <StatusChip
                    status={
                      t.status === "draft" ? "in_progress" : t.status === "submitted" ? "awaiting_validation" : t.status
                    }
                  />
                )}
              </div>

              {t.submission?.description && (
                <div style={{ fontSize: 12, color: C.textDim, marginTop: 8 }}>{t.submission.description}</div>
              )}

              {t.validations.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <button
                    onClick={() => setExpanded((e) => ({ ...e, [t.id]: !e[t.id] }))}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 11,
                      color: C.textDim,
                      padding: 0,
                    }}
                  >
                    {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    Validators ({t.validations.length})
                  </button>

                  {isOpen && (
                    <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                      {t.validations.map((v, i) => (
                        <div
                          key={v.validatorUserId ?? i}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontSize: 12,
                            padding: "6px 10px",
                            background: C.bgHatch,
                            borderRadius: 6,
                          }}
                        >
                          <span style={{ color: C.text }}>{v.validator.name}</span>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: 0.3,
                              color:
                                v.decision === "approved" ? C.green : v.decision === "rejected" ? C.red : C.textFaint,
                            }}
                          >
                            {v.decision}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {data && data.pagination.totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10 }}>
          <Btn variant="ghost" disabled={page <= 1 || isFetching} onClick={() => setPage((p) => p - 1)}>
            Prev
          </Btn>
          <span style={{ fontSize: 11, color: C.textFaint }}>
            Page {data.pagination.page} of {data.pagination.totalPages} · {data.pagination.total} tasks total
          </span>
          <Btn
            variant="ghost"
            disabled={page >= data.pagination.totalPages || isFetching}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Btn>
        </div>
      )}
    </Shell>
  );
}