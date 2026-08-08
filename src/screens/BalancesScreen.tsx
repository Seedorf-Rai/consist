import React, { useCallback, useEffect, useState } from "react";
import { Coins } from "lucide-react";
import { Btn, Card, CenteredNote, ErrorBanner, Header, Shell, Spinner } from "../components/ui";
import { TopBar } from "../components/TopBar";
import { C, FONT_MONO } from "../theme";
import { api, ApiError } from "../lib/api";
import type { BalanceLogEntry, BalanceSummary } from "../types";

export function BalancesScreen({
  groupId,
  groupName,
  onBack,
  flash,
}: {
  groupId: string;
  groupName: string;
  onBack: () => void;
  flash: (msg: string, type?: "ok" | "error") => void;
}) {
  const [summary, setSummary] = useState<BalanceSummary | null>(null);
  const [log, setLog] = useState<BalanceLogEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    Promise.all([api.balances.mine(groupId), api.balances.log(groupId)])
      .then(([s, l]) => {
        setSummary(s);
        setLog(l);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load balances."));
  }, [groupId]);

  useEffect(() => {
    load();
  }, [load]);

  const redeem = async (logId: string) => {
    setRedeemingId(logId);
    try {
      await api.balances.redeem(logId);
      flash("Marked as redeemed.");
      load();
    } catch (err) {
      flash(err instanceof ApiError ? err.message : "Could not redeem this entry.", "error");
    } finally {
      setRedeemingId(null);
    }
  };

  return (
    <Shell>
      <TopBar />
      <Header title="Balances" onBack={onBack} />

      {error && <ErrorBanner message={error} />}
      {!summary && !error && <Spinner />}

      {summary && (
        <Card style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: C.textFaint, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Your balance in {groupName}
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
                  <Btn variant="gold" loading={redeemingId === l.id} onClick={() => redeem(l.id)}>
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
