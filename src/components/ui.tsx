import React, { InputHTMLAttributes, ReactNode } from "react";
import { CheckCircle2, ChevronLeft, Clock, Eye, FileText, Flame, XCircle, Loader2 } from "lucide-react";
import { C, FONT_BODY, FONT_DISPLAY, FONT_MONO } from "../theme";
import type { BoardStatus } from "../types";

export function Seal({
  current,
  longest,
  size = 64,
}: {
  current: number;
  longest: number;
  size?: number;
}) {
  const lit = current > 0;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: `2px dashed ${lit ? C.gold : C.textFaint}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transform: "rotate(-6deg)",
        background: lit ? "rgba(201,169,97,0.07)" : "transparent",
        flexShrink: 0,
      }}
      title={`Longest streak: ${longest}`}
    >
      <Flame size={16} color={lit ? C.gold : C.textFaint} />
      <div
        style={{
          fontFamily: FONT_MONO,
          fontSize: 15,
          fontWeight: 700,
          color: lit ? C.gold : C.textFaint,
          lineHeight: 1,
        }}
      >
        {current}
      </div>
    </div>
  );
}

const STATUS_MAP: Record<BoardStatus, { label: string; color: string; icon: React.ElementType }> = {
  not_started: { label: "Not started", color: C.textFaint, icon: Clock },
  in_progress: { label: "Drafting tasks", color: C.gold, icon: FileText },
  awaiting_validation: { label: "Awaiting validation", color: C.gold, icon: Eye },
  approved: { label: "All approved", color: C.green, icon: CheckCircle2 },
  rejected: { label: "Rejected", color: C.red, icon: XCircle },
};

export function StatusChip({ status }: { status: BoardStatus }) {
  const m = STATUS_MAP[status] ?? STATUS_MAP.not_started;
  const Icon = m.icon;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: FONT_BODY,
        fontSize: 12,
        fontWeight: 600,
        color: m.color,
        border: `1px solid ${m.color}55`,
        background: `${m.color}14`,
        padding: "4px 10px",
        borderRadius: 999,
      }}
    >
      <Icon size={12} /> {m.label}
    </span>
  );
}

type BtnVariant = "default" | "gold" | "green" | "red" | "ghost";

export function Btn({
  children,
  onClick,
  variant = "default",
  disabled,
  loading,
  style,
  full,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: BtnVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: React.CSSProperties;
  full?: boolean;
  type?: "button" | "submit";
}) {
  const variants: Record<BtnVariant, { bg: string; border: string; color: string }> = {
    default: { bg: C.panelAlt, border: C.border, color: C.text },
    gold: { bg: "rgba(201,169,97,0.12)", border: C.gold, color: C.gold },
    green: { bg: "rgba(127,174,140,0.12)", border: C.green, color: C.green },
    red: { bg: "rgba(205,92,92,0.12)", border: C.red, color: C.red },
    ghost: { bg: "transparent", border: "transparent", color: C.textDim },
  };
  const v = variants[variant];
  const isDisabled = disabled || loading;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      style={{
        fontFamily: FONT_BODY,
        fontWeight: 600,
        fontSize: 13,
        padding: "9px 16px",
        borderRadius: 8,
        border: `1px solid ${v.border}`,
        background: v.bg,
        color: v.color,
        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: isDisabled ? 0.45 : 1,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        width: full ? "100%" : undefined,
        justifyContent: full ? "center" : undefined,
        transition: "filter 0.15s",
        ...style,
      }}
      onMouseEnter={(e) => !isDisabled && (e.currentTarget.style.filter = "brightness(1.15)")}
      onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
    >
      {loading ? <Loader2 size={14} className="spin" /> : null}
      {children}
    </button>
  );
}

export function Input({
  label,
  ...props
}: { label?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      {label && (
        <div
          style={{
            fontFamily: FONT_BODY,
            fontSize: 12,
            fontWeight: 600,
            color: C.textDim,
            marginBottom: 6,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          {label}
        </div>
      )}
      <input
        {...props}
        style={{
          width: "100%",
          background: C.bgHatch,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          padding: "10px 12px",
          color: C.text,
          fontFamily: FONT_BODY,
          fontSize: 14,
          outline: "none",
          boxSizing: "border-box",
        }}
      />
    </label>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: C.panel,
        border: `1px solid ${C.borderFaint}`,
        borderRadius: 12,
        padding: 20,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export type ToastState = { msg: string; type: "ok" | "error" } | null;

export function Toast({ toast }: { toast: ToastState }) {
  if (!toast) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        background: C.panelAlt,
        border: `1px solid ${toast.type === "error" ? C.red : C.gold}`,
        color: C.text,
        padding: "12px 20px",
        borderRadius: 10,
        fontFamily: FONT_BODY,
        fontSize: 13,
        maxWidth: 420,
        textAlign: "center",
        zIndex: 50,
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
      }}
    >
      {toast.msg}
    </div>
  );
}

export function Header({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 22,
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{ background: "none", border: "none", cursor: "pointer", color: C.textDim, display: "flex" }}
          >
            <ChevronLeft size={20} />
          </button>
        )}
        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 600, color: C.text, margin: 0 }}>
          {title}
        </h1>
      </div>
      {right}
    </div>
  );
}

export function Shell({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return (
    <div
      style={{
        minHeight: "100%",
        background: C.bg,
        backgroundImage:
          "repeating-linear-gradient(135deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 14px)",
        fontFamily: FONT_BODY,
        color: C.text,
        padding: "28px 20px 60px",
      }}
    >
      <div style={{ maxWidth: wide ? 880 : 560, margin: "0 auto" }}>{children}</div>
    </div>
  );
}

export function CenteredNote({ children }: { children: ReactNode }) {
  return (
    <div style={{ color: C.textFaint, fontSize: 13, textAlign: "center", marginTop: 20 }}>{children}</div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "rgba(205,92,92,0.1)",
        border: `1px solid ${C.red}55`,
        color: C.red,
        borderRadius: 8,
        padding: "10px 14px",
        fontSize: 13,
        marginBottom: 16,
      }}
    >
      <XCircle size={14} /> {message}
    </div>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        color: C.textDim,
        fontSize: 13,
        padding: "40px 0",
      }}
    >
      <Loader2 size={16} className="spin" /> {label || "Loading…"}
    </div>
  );
}
