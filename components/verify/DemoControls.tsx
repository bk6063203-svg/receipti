import Link from "next/link";
import { FlaskConical } from "lucide-react";

const CONTROLS = [
  { label: "Verified", href: "/verify/RCP_8F42K9M2" },
  { label: "Tampered: total", href: "/verify/RCP_8F42K9M2?tamper=total" },
  { label: "Tampered: items", href: "/verify/RCP_8F42K9M2?tamper=items" },
  { label: "Refunded", href: "/verify/RCP_7K2M9QXA" },
  { label: "Partially refunded", href: "/verify/RCP_3P5RT2WQ" },
  { label: "Not found", href: "/verify/RCP_UNKNOWN" },
  { label: "Unavailable", href: "/verify/RCP_9D4F6H8J" },
] as const;

/** Clearly-labeled prototype shortcuts — not production functionality. */
export function DemoControls() {
  return (
    <section
      aria-label="Verification demo controls"
      className="rounded-2xl border border-dashed border-line bg-[var(--r-card)] p-5"
    >
      <p className="type-label flex items-center gap-1.5 text-ink-faint">
        <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
        Demo controls · prototype only
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {CONTROLS.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-lg border border-line bg-background px-3 py-2 text-[0.8125rem] font-medium transition-colors hover:border-ink-faint hover:bg-[#efefec]"
          >
            {c.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
