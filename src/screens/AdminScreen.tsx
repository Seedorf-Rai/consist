import React, { useCallback, useEffect, useState } from "react";
import { Shield, Trash2 } from "lucide-react";
import { Btn, Card, ErrorBanner, Header, Shell, Spinner } from "../components/ui";
import { TopBar } from "../components/TopBar";
import { C, FONT_MONO } from "../theme";
import { api, ApiError } from "../lib/api";
import type { GroupDetail, MemberSummary } from "../types";

const STAKES = [100, 200, 500];

export function AdminScreen({
  groupId,
  onBack,
  onDeleted,
  flash,
}: {
  groupId: string;
  onBack: () => void;
  onDeleted: () => void;
  flash: (msg: string, type?: "ok" | "error") => void;
}) {
  const [detail, setDetail] = useState<GroupDetail | null>(null);
  const [members, setMembers] = useState<MemberSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stakeDraft, setStakeDraft] = useState<number | null>(null);
  const [savingStake, setSavingStake] = useState(false);
  const [kickingId, setKickingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    setError(null);
    Promise.all([api.groups.detail(groupId), api.groups.members(groupId)])
      .then(([d, m]) => {
        setDetail(d);
        setMembers(m);
        setStakeDraft((prev) => prev ?? d.daily_stake);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load admin panel."));
  }, [groupId]);

  useEffect(() => {
    load();
  }, [load]);

  const saveStake = async () => {
    if (stakeDraft === null) return;
    setSavingStake(true);
    try {
      await api.groups.setStake(groupId, stakeDraft);
      flash("Daily stake updated.");
      load();
    } catch (err) {
      flash(err instanceof ApiError ? err.message : "Could not update the stake.", "error");
    } finally {
      setSavingStake(false);
    }
  };

  const kick = async (userId: string, name: string) => {
    setKickingId(userId);
    try {
      await api.groups.kick(groupId, userId);
      flash(`${name} was removed from the group.`);
      load();
    } catch (err) {
      flash(err instanceof ApiError ? err.message : "Could not remove this member.", "error");
    } finally {
      setKickingId(null);
    }
  };

  const deleteGroup = async () => {
    setDeleting(true);
    try {
      await api.groups.delete(groupId);
      flash("Group deleted.");
      onDeleted();
    } catch (err) {
      flash(err instanceof ApiError ? err.message : "Could not delete the group.", "error");
    } finally {
      setDeleting(false);
    }
  };

  if (error) {
    return (
      <Shell>
        <TopBar />
        <Header title="Admin Panel" onBack={onBack} />
        <ErrorBanner message={error} />
      </Shell>
    );
  }

  if (!detail || !members || stakeDraft === null) {
    return (
      <Shell>
        <TopBar />
        <Spinner />
      </Shell>
    );
  }

  return (
    <Shell>
      <TopBar />
      <Header title="Admin Panel" onBack={onBack} />

      <Card style={{ marginBottom: 16 }}>
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
          Daily Stake
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          {STAKES.map((v) => (
            <button
              key={v}
              onClick={() => setStakeDraft(v)}
              style={{
                flex: 1,
                padding: "10px 0",
                borderRadius: 8,
                border: `1px solid ${stakeDraft === v ? C.gold : C.border}`,
                background: stakeDraft === v ? "rgba(201,169,97,0.12)" : C.bgHatch,
                color: stakeDraft === v ? C.gold : C.text,
                fontFamily: FONT_MONO,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              ₹{v}
            </button>
          ))}
        </div>
        <Btn variant="gold" full disabled={stakeDraft === detail.daily_stake} loading={savingStake} onClick={saveStake}>
          Save Stake
        </Btn>
      </Card>

      <Card style={{ marginBottom: 16 }}>
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
          Members
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {members.map((m) => (
            <div key={m.user_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 4px" }}>
              <span style={{ fontSize: 13 }}>
                {m.name} {m.role === "admin" && <Shield size={11} color={C.gold} style={{ marginLeft: 5, display: "inline" }} />}
              </span>
              {m.role !== "admin" && (
                <Btn variant="red" loading={kickingId === m.user_id} onClick={() => kick(m.user_id, m.name)}>
                  <Trash2 size={12} /> Kick
                </Btn>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card>
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
          Danger Zone
        </div>
        <div style={{ fontSize: 12, color: C.textFaint, marginBottom: 10 }}>
          {members.length > 1
            ? "You can only delete this group once every member (including you) has left or been removed."
            : "You're the last member — deleting now removes the group for good."}
        </div>
        <Btn variant="red" full disabled={members.length > 1} loading={deleting} onClick={deleteGroup}>
          <Trash2 size={14} /> Delete Group
        </Btn>
      </Card>
    </Shell>
  );
}
