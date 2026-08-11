import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CheckCircle2,
  Eye,
  ListChecks,
  Shield,
  Wallet,
  Flame,
  History,
  Bell,
} from "lucide-react";
import {
  Btn,
  Card,
  ErrorBanner,
  Header,
  Seal,
  Shell,
  Spinner,
  StatusChip,
} from "../components/ui";

import { TopBar } from "../components/TopBar";
import { C, FONT_DISPLAY, FONT_MONO } from "../theme";
import { ApiError } from "../lib/api";
import { useGroupHome, useLeaveGroup, useResolveDay } from "../queries/groups";
import { useAuth } from "../context/AuthContext";
import { useFlash } from "../routes/RootLayout";
import { useNotifyGroup } from "../queries/groups";

export function GroupHomeScreen() {
  const { groupId = "" } = useParams();
  const navigate = useNavigate();
  const flash = useFlash();
  const { user } = useAuth();

  const { detail, members, board, error, refetchAll } = useGroupHome(groupId);
  const resolveDay = useResolveDay(groupId);
  const leaveGroup = useLeaveGroup(groupId);
  const notifyGroup = useNotifyGroup(groupId);

  const sendNotifications = async () => {
    try {
      const res = await notifyGroup.mutateAsync();
      flash(
        `Notified ${res.sent} member${res.sent === 1 ? "" : "s"}${res.failed ? ` (${res.failed} failed)` : ""}.`,
      );
    } catch (err) {
      flash(
        err instanceof ApiError ? err.message : "Could not send notifications.",
        "error",
      );
    }
  };

  const runResolveDay = async () => {
    try {
      const result = await resolveDay.mutateAsync(undefined);
      const successNames = result.results
        .filter((r) => r.day_success)
        .map(
          (r) =>
            members.data?.find((m) => m.user_id === r.user_id)?.name ||
            r.user_id,
        )
        .join(", ");
      flash(`Day resolved. Succeeded: ${successNames || "no one"}.`);
      refetchAll();
    } catch (err) {
      flash(
        err instanceof ApiError ? err.message : "Could not resolve the day.",
        "error",
      );
    }
  };

  const runLeaveGroup = async () => {
    try {
      await leaveGroup.mutateAsync();
      flash("You left the group.");
      navigate("/");
    } catch (err) {
      flash(
        err instanceof ApiError ? err.message : "Could not leave the group.",
        "error",
      );
    }
  };

  if (error) {
    return (
      <Shell wide>
        <TopBar />
        <Header title="Group" onBack={() => navigate("/")} />
        <ErrorBanner
          message={
            error instanceof ApiError
              ? error.message
              : "Failed to load this group."
          }
        />
      </Shell>
    );
  }

  if (!detail.data || !members.data || !board.data || !user) {
    return (
      <Shell wide>
        <TopBar />
        <Spinner label="Loading group…" />
      </Shell>
    );
  }

  const groupDetail = detail.data;
  const groupMembers = members.data;
  const groupBoard = board.data;

  const isAdmin = groupDetail.admin.id === user.id;
  const myMember = groupMembers.find((m) => m.user_id === user.id);
  const allDone = groupBoard.board.every(
    (b) => b.status === "approved" || b.status === "rejected",
  );
  

  return (
    <Shell wide>
      <TopBar />
      <Header
        title={groupDetail.name}
        onBack={() => navigate("/")}
        right={
          <div style={{ display: "flex", gap: 8 }}>
            {isAdmin && (
              <Btn
                variant="ghost"
                onClick={() => navigate(`/groups/${groupId}/admin`)}
              >
                <Shield size={14} /> Admin
              </Btn>
            )}
            <Btn
              variant="ghost"
              onClick={() => navigate(`/groups/${groupId}/history`)}
            >
              <History size={15} /> History{" "}
            </Btn>
            <Btn
              variant="ghost"
              onClick={() => navigate(`/groups/${groupId}/balances`)}
            >
              <Wallet size={14} /> Balances
            </Btn>
          </div>
        }
      />

      <div
        style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}
      >
        <Card style={{ flex: 1, minWidth: 140, textAlign: "center" }}>
          <div
            style={{
              fontSize: 11,
              color: C.textFaint,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Day
          </div>
          <div
            style={{ fontFamily: FONT_DISPLAY, fontSize: 26, fontWeight: 700 }}
          >
            {groupDetail.current_day}
          </div>
        </Card>
        <Card style={{ flex: 1, minWidth: 140, textAlign: "center" }}>
          <div
            style={{
              fontSize: 11,
              color: C.textFaint,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Daily Stake
          </div>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 26,
              fontWeight: 700,
              color: C.gold,
            }}
          >
            ₹{groupDetail.daily_stake}
          </div>
        </Card>
        <Card style={{ flex: 1, minWidth: 140, textAlign: "center" }}>
          <div
            style={{
              fontSize: 11,
              color: C.textFaint,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            My Streak
          </div>
          <div
            style={{ display: "flex", justifyContent: "center", marginTop: 2 }}
          >
            <Seal
              current={myMember?.streak.current ?? 0}
              longest={myMember?.streak.longest ?? 0}
              size={40}
            />
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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          marginBottom: 22,
        }}
      >
        {groupBoard.board.map((b) => {
          const m = groupMembers.find((x) => x.user_id === b.user_id);
          return (
            <Card
              key={b.user_id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 14,
              }}
            >
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
                    {b.name}{" "}
                    {b.user_id === user.id && (
                      <span style={{ color: C.textFaint, fontWeight: 400 }}>
                        (you)
                      </span>
                    )}
                    {b.user_id === groupDetail.admin.id && (
                      <Shield
                        size={11}
                        color={C.gold}
                        style={{ marginLeft: 5, display: "inline" }}
                      />
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: C.textFaint,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
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
        <Btn
          variant="gold"
          onClick={() => navigate(`/groups/${groupId}/tasks`)}
          disabled={groupDetail.resolved_today}
        >
          <ListChecks size={15} /> My Tasks Today
        </Btn>
        {isAdmin && (
          <Btn variant="ghost" loading={notifyGroup.isPending} onClick={sendNotifications}>
            <Bell size={15} /> Notify Group
          </Btn>
        )}
        <Btn
          onClick={() => navigate(`/groups/${groupId}/validate`)}
          disabled={groupDetail.resolved_today}
        >
          <Eye size={15} /> Validate Others
        </Btn>
        {isAdmin && !groupDetail.resolved_today && (
          <Btn
            variant={allDone ? "green" : "ghost"}
            onClick={runResolveDay}
            disabled={!allDone}
            loading={resolveDay.isPending}
          >
            <CheckCircle2 size={15} /> Resolve Day {groupDetail.current_day}
          </Btn>
        )}
        {isAdmin && !groupDetail.resolved_today && !allDone && (
          <span
            style={{ fontSize: 11, color: C.textFaint, alignSelf: "center" }}
          >
            Waiting on everyone to finish validation before the day can resolve.
          </span>
        )}
        <Btn
          variant="ghost"
          onClick={runLeaveGroup}
          loading={leaveGroup.isPending}
          style={{ marginLeft: "auto" }}
        >
          Leave Group
        </Btn>
      </div>
    </Shell>
  );
}
