import React, { useEffect, useState } from "react";
import {
  Mail, ShieldCheck, Users, Coins, ListChecks, Camera, CheckCircle2,
  Eye, RefreshCcw, BellRing, Scale, Wallet, Flame, Settings, LogOut,
  AlertTriangle, ChevronDown, ChevronRight, X,
} from "lucide-react";

const C = {
  bg: "#12161A",
  panel: "#1B2126",
  panelAlt: "#212830",
  border: "#323C43",
  borderFaint: "#252D33",
  text: "#EEEBE2",
  textDim: "#98A3A8",
  textFaint: "#5E6A70",
  gold: "#C9A961",
  goldDim: "#8C7B4A",
  green: "#7FAE8C",
  red: "#CD5C5C",
};

const FONT_DISPLAY = "'Fraunces', Georgia, serif";
const FONT_BODY = "'Inter', system-ui, sans-serif";
const FONT_MONO = "'JetBrains Mono', 'Courier New', monospace";

function useGoogleFonts() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);
}

interface Step {
  icon: React.ElementType;
  title: string;
  body: string;
  tip?: string;
}

const ONBOARDING: Step[] = [
  {
    icon: Mail,
    title: "Sign up with a valid email",
    body:
      "Create an account with your name, a real email address, and a password. You'll need access to this inbox — the next step depends on it.",
  },
  {
    icon: ShieldCheck,
    title: "Enter the code sent to your email",
    body:
      "A 6-digit code lands in your inbox within moments. Enter it to verify you own the address — your account stays inactive until you do. Code expires in 10 minutes; request a new one if it does.",
    tip: "Not in your inbox? Check spam — verification codes occasionally land there on first send.",
  },
  {
    icon: Users,
    title: "Create a group, or join one",
    body:
      "Start a group and you become its admin, or join an existing one with its exact name and password. Every member in a group commits to the same daily stake.",
  },
  {
    icon: Coins,
    title: "Know the daily stake",
    body:
      "Each group has a fixed amount on the line per day — ₹100, ₹200, or ₹500, set by the admin. Miss your tasks, and that amount is what you owe the members who didn't.",
  },
];

const DAILY_CYCLE: Step[] = [
  {
    icon: ListChecks,
    title: "Create your tasks for the day",
    body:
      "From My Tasks Today, add whatever you're committing to today — a workout, a chapter, a coding problem, anything self-assigned. You need at least one task in before the day's lock time, or today is an automatic miss.",
    tip: "Do this first thing in the morning. Setting tasks early gives you the whole day to actually finish them.",
  },
  {
    icon: Camera,
    title: "Submit proof as you go",
    body:
      "Once a task is done, attach a photo and a short description. This is what your group will review — be specific enough that a stranger could tell it's genuinely finished.",
  },
  {
    icon: Eye,
    title: "Validate other members' tasks",
    body:
      "Every other active member of your group has to approve your submission before it counts — and you'll be reviewing theirs in return. Open Validate Others to see what's waiting on your decision.",
  },
  {
    icon: RefreshCcw,
    title: "Rejected? You get one more shot",
    body:
      "If a member rejects your submission, you can resubmit it with better evidence before the day resolves. A task only fails for good once it's rejected without a resubmission — or the day ends first.",
  },
  {
    icon: BellRing,
    title: "Two reminder windows",
    body:
      "You'll get an email in the middle of the day and again in the evening if there's anything unfinished on your end — tasks not created, tasks not submitted, or other people's tasks waiting on your validation.",
  },
];

const RESOLUTION: Step[] = [
  {
    icon: Scale,
    title: "The day resolves, balances update",
    body:
      "Once the day is over, every member is scored: did they create tasks, and did every one of them get fully approved? The stake from everyone who missed is split evenly across everyone who succeeded.",
  },
  {
    icon: Wallet,
    title: "Check your balance, redeem what's owed",
    body:
      "Head to the Balances screen to see your net position in the group — what's owed to you, and what you owe. If someone's paid you back in person, tap Redeem to mark it settled.",
    tip: "No real money moves inside the app. It only tracks who owes whom — actual payment happens between you, however you'd normally settle up.",
  },
  {
    icon: Flame,
    title: "Streaks track your consistency",
    body:
      "A successful day extends your current streak; a missed day resets it to zero. Your longest streak is kept separately, so a bad week doesn't erase your best run.",
  },
];

const ADMIN: Step[] = [
  {
    icon: Settings,
    title: "Admins set the stake and manage members",
    body:
      "The group admin can change the daily stake at any time and remove members who aren't participating. Removing someone doesn't erase money they already owe — it stays visible until it's redeemed.",
  },
  {
    icon: LogOut,
    title: "Leaving and deleting a group",
    body:
      "Anyone can leave a group at any time; your balance history stays intact for whoever you still owe. A group itself can only be deleted once every member — including the admin — has left.",
  },
];

function SectionLabel({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div
        style={{
          fontFamily: FONT_MONO,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 2,
          color: C.gold,
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        {eyebrow}
      </div>
      <h2
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: "clamp(22px, 3vw, 30px)",
          fontWeight: 600,
          color: C.text,
          margin: 0,
        }}
      >
        {title}
      </h2>
    </div>
  );
}

function StepCard({ step, index }: { step: Step; index: number }) {
  const Icon = step.icon;
  return (
    <div
      style={{
        display: "flex",
        gap: 18,
        padding: "22px 4px",
        borderTop: `1px solid ${C.borderFaint}`,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 44 }}>
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 12,
            fontWeight: 700,
            color: C.textFaint,
            marginBottom: 10,
          }}
        >
          {String(index).padStart(2, "0")}
        </div>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: `1.5px dashed ${C.goldDim}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(201,169,97,0.06)",
          }}
        >
          <Icon size={17} color={C.gold} />
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 600, color: C.text, marginBottom: 6 }}>
          {step.title}
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: 14, lineHeight: 1.6, color: C.textDim }}>{step.body}</div>
        {step.tip && (
          <div
            style={{
              marginTop: 12,
              display: "flex",
              gap: 8,
              alignItems: "flex-start",
              fontFamily: FONT_BODY,
              fontSize: 12.5,
              lineHeight: 1.55,
              color: C.gold,
              background: "rgba(201,169,97,0.07)",
              border: `1px solid rgba(201,169,97,0.25)`,
              borderRadius: 8,
              padding: "10px 12px",
            }}
          >
            <AlertTriangle size={14} style={{ marginTop: 1, flexShrink: 0 }} />
            <span>{step.tip}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function StepGroup({ steps, offset }: { steps: Step[]; offset: number }) {
  return (
    <div>
      {steps.map((s, i) => (
        <StepCard key={s.title} step={s} index={offset + i + 1} />
      ))}
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${C.borderFaint}` }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "16px 4px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          textAlign: "left",
          fontFamily: FONT_BODY,
          fontSize: 14.5,
          fontWeight: 600,
          color: C.text,
        }}
      >
        {q}
        {open ? <ChevronDown size={16} color={C.textFaint} /> : <ChevronRight size={16} color={C.textFaint} />}
      </button>
      {open && (
        <div
          style={{
            padding: "0 4px 18px",
            fontFamily: FONT_BODY,
            fontSize: 13.5,
            lineHeight: 1.6,
            color: C.textDim,
          }}
        >
          {a}
        </div>
      )}
    </div>
  );
}

export default function PactUserManual({ onClose }: { onClose?: () => void }) {
  useGoogleFonts();

  return (
    <div
      style={{
        minHeight: "100%",
        background: C.bg,
        backgroundImage:
          "repeating-linear-gradient(135deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 14px)",
        fontFamily: FONT_BODY,
        color: C.text,
        padding: "0 0 80px",
      }}
    >
      <div style={{ borderBottom: `1px solid ${C.borderFaint}`, padding: "56px 20px 44px", position: "relative" }}>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close user manual"
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              background: C.panelAlt,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              width: 34,
              height: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: C.textDim,
              cursor: "pointer",
            }}
          >
            <X size={16} />
          </button>
        )}
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 2,
              color: C.gold,
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            User Manual
          </div>
          <h1
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 700,
              color: C.text,
              margin: "0 0 16px",
              letterSpacing: 0.2,
            }}
          >
            THE PACT
          </h1>
          <p style={{ fontFamily: FONT_BODY, fontSize: 16, lineHeight: 1.6, color: C.textDim, maxWidth: 560, margin: 0 }}>
            A group commitment, with real stakes attached. Everyone sets their own daily tasks, everyone proves
            they did them, and everyone else has to agree. Miss a day, and you owe the people who didn't.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px" }}>
        <div style={{ paddingTop: 48 }}>
          <SectionLabel eyebrow="Getting started" title="Create your account and find your group" />
          <StepGroup steps={ONBOARDING} offset={0} />
        </div>

        <div style={{ paddingTop: 48 }}>
          <SectionLabel eyebrow="Every day" title="The daily cycle" />
          <StepGroup steps={DAILY_CYCLE} offset={ONBOARDING.length} />
        </div>

        <div style={{ paddingTop: 48 }}>
          <SectionLabel eyebrow="End of day" title="Resolution, balances, and streaks" />
          <StepGroup steps={RESOLUTION} offset={ONBOARDING.length + DAILY_CYCLE.length} />
        </div>

        <div style={{ paddingTop: 48 }}>
          <SectionLabel eyebrow="Running a group" title="For group admins" />
          <StepGroup steps={ADMIN} offset={ONBOARDING.length + DAILY_CYCLE.length + RESOLUTION.length} />
        </div>

        <div style={{ paddingTop: 56 }}>
          <SectionLabel eyebrow="Quick reference" title="Screens at a glance" />
          <div
            style={{
              background: C.panel,
              border: `1px solid ${C.borderFaint}`,
              borderRadius: 12,
              padding: 4,
            }}
          >
            {[
              ["My Groups", "Every group you're in, with your streak and balance in each."],
              ["Group Home / Today's Board", "See where everyone stands today, at a glance."],
              ["My Tasks Today", "Create today's tasks and attach evidence once they're done."],
              ["Validate Others", "Approve or reject tasks other members have submitted."],
              ["Balances", "Your net position in a group, plus a Redeem button for what's owed to you."],
              ["Balance Log", "Full history of who owed whom, and whether it's settled."],
              ["Admin Panel", "Change the stake, remove members, or delete the group."],
            ].map(([name, desc], i) => (
              <div
                key={name}
                style={{
                  display: "flex",
                  gap: 16,
                  padding: "14px 16px",
                  borderTop: i === 0 ? "none" : `1px solid ${C.borderFaint}`,
                }}
              >
                <div style={{ fontFamily: FONT_BODY, fontSize: 13.5, fontWeight: 700, color: C.text, width: 190, flexShrink: 0 }}>
                  {name}
                </div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.textDim, lineHeight: 1.5 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ paddingTop: 56 }}>
          <SectionLabel eyebrow="Good to know" title="Common questions" />
          <div style={{ borderTop: `1px solid ${C.borderFaint}` }}>
            <FAQItem
              q="Does real money move through the app?"
              a="No. The app only keeps a ledger of who owes whom, based on daily results. Actual payment happens between members however you'd normally settle up — the app's Redeem button just marks a debt as settled once that's happened."
            />
            <FAQItem
              q="What happens if everyone in the group succeeds, or everyone fails?"
              a="If everyone succeeds, no money changes hands — there's nothing to redistribute. If everyone fails, stakes are void for that day rather than carried forward; there's no one left to receive the pool."
            />
            <FAQItem
              q="I didn't get my verification code or reminder email — now what?"
              a="Check your spam folder first — verification and reminder emails occasionally land there, especially on the first one or two sends. If it's still missing, use Resend Code on the verification screen."
            />
            <FAQItem
              q="Can I fix a task after it's been rejected?"
              a="Yes, once. If a validator rejects your submission, you can resubmit better evidence before the day resolves. There's no second resubmission — make it count."
            />
            <FAQItem
              q="What if I join a group partway through the day?"
              a="You'll be asked to validate any tasks that were already submitted and are still awaiting a decision from the rest of the group. Tasks from days before you joined aren't your concern."
            />
          </div>
        </div>

        <div
          style={{
            marginTop: 64,
            paddingTop: 24,
            borderTop: `1px solid ${C.borderFaint}`,
            fontFamily: FONT_MONO,
            fontSize: 11,
            color: C.textFaint,
            letterSpacing: 0.5,
            textAlign: "center",
          }}
        >
          THE PACT — put money where your streak is.
        </div>
      </div>
    </div>
  );
}
