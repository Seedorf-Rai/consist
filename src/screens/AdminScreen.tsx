import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Shield, Trash2 } from "lucide-react";
import { Btn, Card, ErrorBanner, Header, Shell, Spinner } from "../components/ui";
import { TopBar } from "../components/TopBar";
import { C, FONT_MONO } from "../theme";
import { ApiError } from "../lib/api";
import { useDeleteGroup, useGroupDetail, useGroupMembers, useKickMember, useSetStake } from "../queries/groups";
import { useFlash } from "../routes/RootLayout";

const STAKES = [100, 200, 500];

export function AdminScreen() {
  const { groupId = "" } = useParams();
  const navigate = useNavigate();
  const flash = useFlash();

  const { data: detail, error: detailError } = useGroupDetail(groupId);
  const { data: members, error: membersError } = useGroupMembers(groupId);
  const error = detailError || membersError;

  const [stakeDraft, setStakeDraft] = useState<number | null>(null);
  useEffect(() => {
    if (detail && stakeDraft === null) setStakeDraft(detail.daily_stake);
  }, [detail, stakeDraft]);

  const setStake = useSetStake(groupId);
  const kickMember = useKickMember(groupId);
  const deleteGroup = useDeleteGroup(groupId);

  const saveStake = async () => {
    if (stakeDraft === null) return;
    try {
      await setStake.mutateAsync(stakeDraft);
      flash("Daily stake updated.");
    } catch (err) {
      flash(err instanceof ApiError ? err.message : "Could not update the stake.", "error");
    }
  };

  const kick = async (userId: string, name: string) => {
    try {
      await kickMember.mutateAsync(userId);
      flash(`${name} was removed from the group.`);
    } catch (err) {
      flash(err instanceof ApiError ? err.message : "Could not remove this member.", "error");
    }
  };

  const runDeleteGroup = async () => {
    try {
      await deleteGroup.mutateAsync();
      flash("Group deleted.");
      navigate("/");
    } catch (err) {
      flash(err instanceof ApiError ? err.message : "Could not delete the group.", "error");
    }
  };

  if (error) {
    return (
      <Shell>
        <TopBar />
        <Header title="Admin Panel" onBack={() => navigate(`/groups/${groupId}`)} />
        <ErrorBanner message={error instanceof ApiError ? error.message : "Failed to load admin panel."} />
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
      <Header title="Admin Panel" onBack={() => navigate(`/groups/${groupId}`)} />

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
        <Btn variant="gold" full disabled={stakeDraft === detail.daily_stake} loading={setStake.isPending} onClick={saveStake}>
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
                <Btn
                  variant="red"
                  loading={kickMember.isPending && kickMember.variables === m.user_id}
                  onClick={() => kick(m.user_id, m.name)}
                >
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
        <Btn variant="red" full disabled={members.length > 1} loading={deleteGroup.isPending} onClick={runDeleteGroup}>
          <Trash2 size={14} /> Delete Group
        </Btn>
      </Card>
    </Shell>
  );
}
