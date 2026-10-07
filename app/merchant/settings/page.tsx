"use client";

import * as React from "react";
import { Plug, Store } from "lucide-react";
import { Badge, Button, Card, Input, useToast } from "@/components/ui";
import { FadeIn, useMerchant } from "@/components/merchant";

const DISPLAY_KEY = "receipti.merchant.display.v1";
const PREFS_KEY = "receipti.merchant.prefs.v1";

interface Prefs {
  refundAlerts: boolean;
  weeklySummary: boolean;
  verificationAlerts: boolean;
}

const DEFAULT_PREFS: Prefs = { refundAlerts: true, weeklySummary: false, verificationAlerts: true };

function loadPrefs(): Prefs {
  try {
    const raw = JSON.parse(window.localStorage.getItem(PREFS_KEY) ?? "{}") as Partial<Prefs>;
    return { ...DEFAULT_PREFS, ...raw };
  } catch {
    return DEFAULT_PREFS;
  }
}

export default function MerchantSettingsPage() {
  const { merchant, receipts } = useMerchant();
  const { toast } = useToast();
  const [display, setDisplay] = React.useState(merchant.name);
  const [prefs, setPrefs] = React.useState<Prefs>(DEFAULT_PREFS);

  React.useEffect(() => {
    try {
      setDisplay(window.localStorage.getItem(DISPLAY_KEY) ?? merchant.name);
    } catch {
      setDisplay(merchant.name);
    }
    setPrefs(loadPrefs());
  }, [merchant.name]);

  const saveDisplay = () => {
    try {
      window.localStorage.setItem(DISPLAY_KEY, display.trim() || merchant.name);
    } catch {
      /* best-effort */
    }
    toast({ tone: "success", title: "Display name saved", description: "Stored on this device (demo)." });
  };

  const togglePref = (key: keyof Prefs) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        window.localStorage.setItem(PREFS_KEY, JSON.stringify(next));
      } catch {
        /* best-effort */
      }
      return next;
    });
  };

  const lastActivity = [...receipts]
    .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt))[0]?.issuedAt
    ?.slice(0, 10);

  const PREF_ROWS: { key: keyof Prefs; title: string; text: string }[] = [
    { key: "refundAlerts", title: "Refund alerts", text: "Notify when a customer requests a return." },
    { key: "verificationAlerts", title: "Verification alerts", text: "Notify when a check reports a mismatch." },
    { key: "weeklySummary", title: "Weekly summary", text: "A Monday recap of receipts and refunds." },
  ];

  return (
    <div className="flex flex-col gap-5">
      <FadeIn>
        <p className="type-label text-[var(--r-primary)]">{merchant.name}</p>
        <h1 className="type-h1 mt-1">Settings</h1>
        <p className="type-small mt-1 text-ink-muted">
          Workspace preferences for this demo merchant — saved on this device.
        </p>
      </FadeIn>

      <FadeIn delay={0.05}>
        <Card as="section" aria-label="Business profile">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--r-primary-muted)] text-[var(--r-primary)]">
              <Store className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="type-h4">Business profile</h2>
              <p className="type-small text-ink-muted">
                {merchant.trade} · {merchant.branch} · {receipts.length} receipts on record
              </p>
            </div>
          </div>
          <div className="mt-4 flex max-w-md flex-col gap-2">
            <label htmlFor="display-name" className="type-small font-semibold">
              Display name
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id="display-name"
                value={display}
                onChange={(e) => setDisplay(e.target.value)}
                maxLength={60}
              />
              <Button onClick={saveDisplay} className="shrink-0">
                Save
              </Button>
            </div>
          </div>
        </Card>
      </FadeIn>

      <FadeIn delay={0.08}>
        <Card as="section" aria-label="POS connection">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--r-primary-muted)] text-[var(--r-primary)]">
              <Plug className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="type-h4">{merchant.posName}</h2>
              <p className="type-small text-ink-muted">
                {lastActivity ? `Last receipt activity ${lastActivity}` : "No receipt activity yet"}
              </p>
            </div>
            <Badge tone="success" dot>
              Connected
            </Badge>
          </div>
          <p className="type-caption mt-3 text-ink-faint">
            Demo connection — no live sync. Manage the full integration under Integration.
          </p>
        </Card>
      </FadeIn>

      <FadeIn delay={0.11}>
        <Card as="section" aria-label="Notification preferences">
          <h2 className="type-h4">Notifications</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {PREF_ROWS.map((row) => {
              const on = prefs[row.key];
              return (
                <li
                  key={row.key}
                  className="flex items-center gap-3 rounded-xl bg-background px-4 py-3"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{row.title}</span>
                    <span className="type-caption block text-ink-muted">{row.text}</span>
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={on}
                    aria-label={row.title}
                    onClick={() => togglePref(row.key)}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? "bg-[var(--r-primary)]" : "bg-line"}`}
                  >
                    <span
                      aria-hidden="true"
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-[1.375rem]" : "left-0.5"}`}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
      </FadeIn>
    </div>
  );
}
