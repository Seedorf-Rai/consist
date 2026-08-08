import React, { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Eye, ListChecks, Shield, Wallet, Flame } from "lucide-react";
import { Btn, Card, ErrorBanner, Header, Seal, Shell, Spinner, StatusChip } from "../components/ui";
import { TopBar } from "../components/TopBar";
import { C, FONT_DISPLAY, FONT_MONO } from "../theme";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { GroupDetail, MemberSummary, TodayBoard } from "../types";

export function GroupHomeScreen({
  groupId,
  onBack,
  onOpenAdmin,
  onOpenBalances,
  onOpenMyTasks,
  onOpenValidate,
  onLeft,
  flash,
}: {
  groupId: string;
  onBack: () => void;
  onOpenAdmin: () => void;
  onOpenBalances: () => void;
  onOpenMyTasks: () => void;
  onOpenValidate: () => void;
  onLeft: () => void;
  flash: (msg: string, type?: "ok" | "error") => void;
}) {
  const { user } = useAuth();
  const [detail, setDetail] = useState<GroupDetail | null>(null);
  const [members, setMembers] = useState<MemberSummary[] | null>(null);
  const [board, setBoard] = useState<TodayBoard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const load = useCallback(() => {
    setError(null);
    Promise.all([api.groups.detail(groupId), api.groups.members(groupId), api.groups.today(groupId)])
      .then(([d, m, b]) => {
        setDetail(d);
        setMembers(m);
        setBoard(b);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load this group."));
  }, [groupId]);

  useEffect(() => {
    load();
  }, [load]);

  const resolveDay = async () => {
    setResolving(true);
    try {
      const result = await api.groups.resolveDay(groupId);
      const successNames = result.results
        .filter((r) => r.day_success)
        .map((r) => members?.find((m) => m.user_id === r.user_id)?.name || r.user_id)
        .join(", ");
      flash(`Day resolved. Succeeded: ${successNames || "no one"}.`);
      load();
    } catch (err) {
      flash(err instanceof ApiError ? err.message : "Could not resolve the day.", "error");
    } finally {
      setResolving(false);
    }
  };

  const leaveGroup = async () => {
    setLeaving(true);
    try {
      await api.groups.leave(groupId);
      flash("You left the group.");
      onLeft();
    } catch (err) {
      flash(err instanceof ApiError ? err.message : "Could not leave the group.", "error");
    } finally {
      setLeaving(false);
    }
  };

  if (error) {
    return (
      <Shell wide>
        <TopBar />
        <Header title="Group" onBack={onBack} />
        <ErrorBanner message={error} />
      </Shell>
    );
  }

  if (!detail || !members || !board || !user) {
    return (
      <Shell wide>
        <TopBar />
        <Spinner label="Loading group…" />
      </Shell>
    );
  }

  const isAdmin = detail.admin.id === user.id;
  const myMember = members.find((m) => m.user_id === user.id);
  const allDone = board.board.every((b) => b.status === "approved" || b.status === "rejected");

  return (
    <Shell wide>
      <TopBar />
      <Header
        title={detail.name}
        onBack={onBack}
        right={
          <div style={{ display: "flex", gap: 8 }}>
            {isAdmin && (
              <Btn variant="ghost" onClick={onOpenAdmin}>
                <Shield size={14} /> Admin
              </Btn>
            )}
            <Btn variant="ghost" onClick={onOpenBalances}>
              <Wallet size={14} /> Balances
            </Btn>
          </div>
        }
      />

      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <Card style={{ flex: 1, minWidth: 140, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: C.textFaint, textTransform: "uppercase", letterSpacing: 0.5 }}>Day</div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 26, fontWeight: 700 }}>{detail.current_day}</div>
        </Card>
        <Card style={{ flex: 1, minWidth: 140, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: C.textFaint, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Daily Stake
          </div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 26, fontWeight: 700, color: C.gold }}>
            ₹{detail.daily_stake}
          </div>
        </Card>
        <Card style={{ flex: 1, minWidth: 140, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: C.textFaint, textTransform: "uppercase", letterSpacing: 0.5 }}>
            My Streak
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
            <Seal current={myMember?.streak.current ?? 0} longest={myMember?.streak.longest ?? 0} size={40} />
          </div>
        </Card>
      </div>

      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: C.textDim,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          marginBottom: 10,
        }}
      >
        Today's Board
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
        {board.board.map((b) => {
          const m = members.find((x) => x.user_id === b.user_id);
          return (
            <Card key={b.user_id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: C.panelAlt,
                    border: `1px solid ${C.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: FONT_DISPLAY,
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {b.name[0]}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>
                    {b.name} {b.user_id === user.id && <span style={{ color: C.textFaint, fontWeight: 400 }}>(you)</span>}
                    {b.user_id === detail.admin.id && (
                      <Shield size={11} color={C.gold} style={{ marginLeft: 5, display: "inline" }} />
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: C.textFaint, display: "flex", alignItems: "center", gap: 4 }}>
                    <Flame size={10} /> {m?.streak.current ?? 0} day streak
                  </div>
                </div>
              </div>
              <StatusChip status={b.status} />
            </Card>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Btn variant="gold" onClick={onOpenMyTasks} disabled={detail.resolved_today}>
          <ListChecks size={15} /> My Tasks Today
        </Btn>
        <Btn onClick={onOpenValidate} disabled={detail.resolved_today}>
          <Eye size={15} /> Validate Others
        </Btn>
        {isAdmin && !detail.resolved_today && (
          <Btn variant={allDone ? "green" : "ghost"} onClick={resolveDay} disabled={!allDone} loading={resolving}>
            <CheckCircle2 size={15} /> Resolve Day {detail.current_day}
          </Btn>
        )}
        {isAdmin && !detail.resolved_today && !allDone && (
          <span style={{ fontSize: 11, color: C.textFaint, alignSelf: "center" }}>
            Waiting on everyone to finish validation before the day can resolve.
          </span>
        )}
        <Btn variant="ghost" onClick={leaveGroup} loading={leaving} style={{ marginLeft: "auto" }}>
          Leave Group
        </Btn>
      </div>
    </Shell>
  );
}
