import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { Btn } from "./ui";
import { C, FONT_DISPLAY, FONT_BODY } from "../theme";
import { useMarkAnnouncementSeen, useUnseenAnnouncements } from "../queries/announcements";

export function AnnouncementModal() {
  const { data: unseen } = useUnseenAnnouncements(true);
  const markSeen = useMarkAnnouncementSeen();
  const [index, setIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  if (!unseen || unseen.length === 0 || dismissed) return null;
  if (index >= unseen.length) return null;

  const current = unseen[index];
  const isLast = index === unseen.length - 1;

  const advance = async () => {
    try {
      await markSeen.mutateAsync([current.id]);
    } catch {
      // Non-fatal — worst case they see this one again next login.
    }
    if (isLast) setDismissed(true);
    else setIndex((i) => i + 1);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 20,
      }}
    >
      <div
        style={{
          background: C.panel,
          border: `1px solid ${C.borderFaint}`,
          borderRadius: 14,
          padding: 28,
          maxWidth: 420,
          width: "100%",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "rgba(201,169,97,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <Sparkles size={20} color={C.gold} />
        </div>
        <div style={{ fontSize: 11, color: C.textFaint, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
          What's New
        </div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 600, color: C.text, marginBottom: 10 }}>
          {current.title}
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: 14, lineHeight: 1.6, color: C.textDim, marginBottom: 22 }}>
          {current.description}
        </div>
        {unseen.length > 1 && (
          <div style={{ fontSize: 11, color: C.textFaint, marginBottom: 14 }}>
            {index + 1} of {unseen.length}
          </div>
        )}
        <Btn variant="gold" full loading={markSeen.isPending} onClick={advance}>
          {isLast ? "Got it" : "Continue"}
        </Btn>
      </div>
    </div>
  );
}