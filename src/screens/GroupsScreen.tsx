import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Shield, Users } from "lucide-react";
import { Btn, Card, ErrorBanner, Header, Seal, Shell, Spinner } from "../components/ui";
import { TopBar } from "../components/TopBar";
import { C, FONT_DISPLAY } from "../theme";
import { ApiError } from "../lib/api";
import { useMyGroups } from "../queries/groups";

export function GroupsScreen() {
  const navigate = useNavigate();
  const { data: groups, error, isLoading } = useMyGroups();

  return (
    <Shell>
      <TopBar />
      <Header title="My Groups" />
      {error && (
        <ErrorBanner message={error instanceof ApiError ? error.message : "Failed to load groups."} />
      )}
      {isLoading && !error && <Spinner label="Loading your groups…" />}

      {groups && groups.length === 0 && (
        <Card style={{ textAlign: "center", color: C.textDim, marginBottom: 20 }}>
          You're not in any group yet. Create one or join with a name + password.
        </Card>
      )}

      {groups && groups.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
          {groups.map((g) => (
            <Card key={g.id} style={{ cursor: "pointer" }}>
              <div
                onClick={() => navigate(`/groups/${g.id}`)}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <Seal current={g.my_streak.current} longest={g.my_streak.longest} size={48} />
                  <div>
                    <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 600 }}>
                      {g.name}{" "}
                      {g.is_admin && <Shield size={13} color={C.gold} style={{ marginLeft: 4, display: "inline" }} />}
                    </div>
                    <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>
                      {g.member_count} members · stake ₹{g.daily_stake}/day · Day {g.current_day}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 16,
                      fontWeight: 700,
                      color: g.my_balance >= 0 ? C.green : C.red,
                    }}
                  >
                    {g.my_balance >= 0 ? "+" : ""}₹{g.my_balance}
                  </div>
                  <div style={{ fontSize: 10, color: C.textFaint, textTransform: "uppercase" }}>balance</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        <Btn variant="gold" full onClick={() => navigate("/groups/new")}>
          <Plus size={15} /> Create Group
        </Btn>
        <Btn full onClick={() => navigate("/groups/join")}>
          <Users size={15} /> Join Group
        </Btn>
      </div>
    </Shell>
  );
}
