import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Coins } from "lucide-react";
import { Btn, Card, CenteredNote, ErrorBanner, Header, Shell, Spinner } from "../components/ui";
import { TopBar } from "../components/TopBar";
import { C, FONT_MONO } from "../theme";
import { ApiError } from "../lib/api";
import { useBalanceLog, useMyBalance, useRedeemBalance } from "../queries/balances";
import { useGroupDetail } from "../queries/groups";
import { useFlash } from "../routes/RootLayout";

export function BalancesScreen() {
  const { groupId = "" } = useParams();
  const navigate = useNavigate();
  const flash = useFlash();

  // Group name isn't in the URL, so pull it from the group detail query —
  // it's already cached from GroupHomeScreen most of the time.
  const { data: detail } = useGroupDetail(groupId);
  const { data: summary, error, isLoading } = useMyBalance(groupId);
  const { data: log } = useBalanceLog(groupId);
  const redeem = useRedeemBalance(groupId);

  const runRedeem = async (logId: string) => {
    try {
      await redeem.mutateAsync(logId);
      flash("Marked as redeemed.");
    } catch (err) {
      flash(err instanceof ApiError ? err.message : "Could not redeem this entry.", "error");
    }
  };

  return (
    <Shell>
      <TopBar />
      <Header title="Balances" onBack={() => navigate(`/groups/${groupId}`)} />

      {error && (
        <ErrorBanner message={error instanceof ApiError ? error.message : "Failed to load balances."} />
      )}
      {isLoading && !error && <Spinner />}

      {summary && (
        <Card style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: C.textFaint, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Your balance in {detail?.name ?? "this group"}
          </div>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 36,
              fontWeight: 700,
              color: summary.balance >= 0 ? C.green : C.red,
              marginTop: 4,
            }}
          >
            {summary.balance >= 0 ? "+" : ""}₹{summary.balance}
          </div>
          <div style={{ fontSize: 11, color: C.textFaint, marginTop: 4 }}>
            {summary.balance >= 0 ? "You're owed this much" : "You owe this much"}
          </div>
        </Card>
      )}

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
        Balance Log
      </div>
      {log && log.length === 0 && <CenteredNote>No transactions yet.</CenteredNote>}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {log?.map((l) => {
          const owedToMe = l.direction === "owed_to_me";
          return (
            <Card key={l.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 14, flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>
                  {owedToMe ? `${l.counterparty} owes you` : `You owe ${l.counterparty}`}
                </div>
                <div style={{ fontSize: 11, color: C.textFaint, marginTop: 2 }}>
                  {l.date} · {l.reason}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontFamily: FONT_MONO, fontWeight: 700, color: owedToMe ? C.green : C.red }}>
                  ₹{l.amount}
                </div>
                {l.redeemed ? (
                  <span style={{ fontSize: 10, color: C.textFaint, border: `1px solid ${C.border}`, borderRadius: 999, padding: "3px 8px" }}>
                    Redeemed
                  </span>
                ) : owedToMe ? (
                  <Btn
                    variant="gold"
                    loading={redeem.isPending && redeem.variables === l.id}
                    onClick={() => runRedeem(l.id)}
                  >
                    <Coins size={12} /> Redeem
                  </Btn>
                ) : (
                  <span style={{ fontSize: 10, color: C.textFaint, border: `1px solid ${C.border}`, borderRadius: 999, padding: "3px 8px" }}>
                    Pending
                  </span>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </Shell>
  );
}
