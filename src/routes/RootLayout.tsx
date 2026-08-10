import React from "react";
import { Outlet, useNavigate, useOutletContext } from "react-router-dom";
import { HelpCircle } from "lucide-react";
import { Toast } from "../components/ui";
import { useToast } from "../hooks/useToast";

export type Flash = (msg: string, type?: "ok" | "error") => void;

/** Small helper so screens can write `const flash = useFlash()` instead of
 *  destructuring useOutletContext every time. */
export function useFlash(): Flash {
  const context = useOutletContext<{ flash: Flash } | undefined>();
  if (!context) {
    throw new Error(
      "useFlash() called outside RootLayout's outlet context — check that every nested route element forwards <Outlet context={...} />."
    );
  }
  return context.flash;
}

export function RootLayout() {
  const { toast, flash } = useToast();
  const navigate = useNavigate();

  return (
    <>
      <Outlet context={{ flash }} />

      <button
        onClick={() => navigate("/manual")}
        aria-label="Open user manual"
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "#1B2126",
          border: "1px solid #323C43",
          color: "#C9A961",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          zIndex: 40,
        }}
      >
        <HelpCircle size={20} />
      </button>

      <Toast toast={toast} />
    </>
  );
}
