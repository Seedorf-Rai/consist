import React from "react";
import { LogOut } from "lucide-react";
import { C, FONT_DISPLAY } from "../theme";
import { useAuth } from "../context/AuthContext";

export function TopBar() {
  const { user, logout } = useAuth();
  if (!user) return null;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
        paddingBottom: 16,
        borderBottom: `1px solid ${C.borderFaint}`,
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 700, color: C.gold, letterSpacing: 0.5 }}>
        THE PACT
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 12, color: C.textDim }}>
          Signed in as <b style={{ color: C.text }}>{user.name}</b>
        </span>
        <button
          onClick={logout}
          title="Log out"
          style={{ background: "none", border: "none", color: C.textDim, cursor: "pointer", display: "flex" }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
}
