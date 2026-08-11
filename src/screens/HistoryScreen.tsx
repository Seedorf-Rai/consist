import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Btn, Card, ErrorBanner, Header, Shell, Spinner, StatusChip } from "../components/ui";
import { TopBar } from "../components/TopBar";
import { C } from "../theme";
import { ApiError } from "../lib/api";
import { useMyTaskHistory } from "../queries/tasks";
import { ChevronDown, ChevronRight } from "lucide-react";

import type { TaskHistoryItem } from "../types";

const DAY_MS = 24 * 60 * 60 * 1000;

/** A task is "missed" once it's more than 24h old and never reached a
 *  resolved outcome. Draft = never submitted, submitted = submitted but
 *  validators never finished deciding. Approved/rejected are resolved
 *  outcomes, not misses, regardless of age. */
function missedLabel(task: TaskHistoryItem): string | null {
  const ageMs = Date.now() - new Date(task.createdAt).getTime();
  if (ageMs < DAY_MS) return null;
  if (task.status === "draft") return "Completion missed";
  if (task.status === "submitted") return "Validation missed";
  return null;
}
export function HistoryScreen() {
  const { groupId = "" } = useParams();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const { data: history, error, isLoading } = useMyTaskHistory(groupId, {
    page,
    pageSize: 20,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  return (
    <Shell>
      <TopBar />
      <Header title="My Task History" onBack={() => navigate(`/groups/${groupId}`)} />

      {error && (
        <ErrorBanner message={error instanceof ApiError ? error.message : "Failed to load history."} />
      )}

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            style={{
              background: C.bgHatch,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              padding: "8px 10px",
              color: C.text,
              fontSize: 12,
            }}
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            style={{
              background: C.bgHatch,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              padding: "8px 10px",
              color: C.text,
              fontSize: 12,
            }}
          />
          {(startDate || endDate) && (
            <Btn
              variant="ghost"
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setPage(1);
              }}
            >
              Clear
            </Btn>
          )}
        </div>
      </Card>

      {isLoading && !error && <Spinner label="Loading history…" />}

      {history && history.tasks.length === 0 && (
        <div style={{ fontSize: 12, color: C.textFaint, textAlign: "center", padding: "20px 0" }}>
          No tasks in this range.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {history?.tasks.map((t) => (
          <Card key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 14 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{t.title}</div>
              <div style={{ fontSize: 11, color: C.textFaint, marginTop: 2 }}>{t.date}</div>
            </div>
            <StatusChip
              status={
                t.status === "draft" ? "in_progress" : t.status === "submitted" ? "awaiting_validation" : t.status
              }
            />
          </Card>
        ))}
      </div>

      {history?.tasks.map((t) => {
          const missed = missedLabel(t);
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
                      {t.validations.map((v) => (
                        <div
                          key={v.id}
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
    </Shell>
  );
}