import { QrCode, ScanLine } from "lucide-react";
import { cn } from "@/lib/utils";

export interface QRPanelProps {
  /** Stable reference encoded in the QR (URL or opaque token). */
  payload: string;
  caption?: string;
  size?: "sm" | "md";
  className?: string;
}

/**
 * QR access panel foundation. Phase 01 renders a deterministic
 * placeholder grid (NOT a scannable code) — real QR encoding lands
 * with the verification phase. Layout/API stay the same.
 */
export function QRPanel({ payload, caption, size = "md", className }: QRPanelProps) {
  const box = size === "sm" ? "h-32 w-32" : "h-44 w-44";
  return (
    <figure className={cn("flex flex-col items-center gap-2.5", className)}>
      <div
        role="img"
        aria-label={`QR reference for ${payload}`}
        className={cn(
          "relative flex items-center justify-center overflow-hidden rounded-xl border border-line bg-[var(--r-card)]",
          box
        )}
      >
        {/* Deterministic decorative grid — replaced by a real QR later. */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full opacity-[0.08]" aria-hidden="true">
          {Array.from({ length: 10 }).map((_, r) =>
            Array.from({ length: 10 }).map((_, c) =>
              (r * 7 + c * 13 + payload.length) % 3 === 0 ? (
                <rect key={`${r}-${c}`} x={c * 10 + 1} y={r * 10 + 1} width="8" height="8" fill="#111" />
              ) : null
            )
          )}
        </svg>
        <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--r-dark)] text-[var(--r-on-dark)]">
          <QrCode className="h-6 w-6" aria-hidden="true" />
        </span>
      </div>
      <figcaption className="flex max-w-56 items-center gap-1.5 text-center type-caption text-ink-muted">
        <ScanLine className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        {caption ?? "Scan to open the trusted receipt"}
      </figcaption>
    </figure>
  );
}
