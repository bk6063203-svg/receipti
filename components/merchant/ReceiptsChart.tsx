"use client";

import type { WeekBucket } from "@/lib/merchant";
import { cn } from "@/lib/utils";

/** Lightweight 7-day receipts bar chart (inline SVG, no chart library). */
export function ReceiptsChart({ buckets }: { buckets: WeekBucket[] }) {
  const max = Math.max(1, ...buckets.map((b) => b.count));
  const W = 320;
  const H = 148;
  const BASE = 122;
  const slot = W / buckets.length;
  const barW = Math.min(34, slot * 0.44);
  const total = buckets.reduce((s, b) => s + b.count, 0);

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Digital receipts issued per day over the last 7 days, ${total} in total.`}
        className="h-auto w-full"
      >
        <line x1="0" y1={BASE} x2={W} y2={BASE} stroke="var(--r-line)" strokeWidth="1" />
        {buckets.map((b, i) => {
          const h = b.count === 0 ? 0 : Math.max(6, (b.count / max) * 84);
          const x = i * slot + (slot - barW) / 2;
          const isToday = i === buckets.length - 1;
          return (
            <g key={b.key}>
              <title>{`${b.label}: ${b.count} receipt${b.count === 1 ? "" : "s"}`}</title>
              {h > 0 && (
                <rect
                  x={x}
                  y={BASE - h}
                  width={barW}
                  height={h}
                  rx="4"
                  fill="var(--r-primary)"
                  opacity={isToday ? 1 : 0.45}
                />
              )}
              {b.count > 0 && (
                <text
                  x={i * slot + slot / 2}
                  y={BASE - h - 6}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="700"
                  fill="var(--r-ink)"
                >
                  {b.count}
                </text>
              )}
              <text
                x={i * slot + slot / 2}
                y={BASE + 18}
                textAnchor="middle"
                fontSize="10.5"
                fill="var(--r-ink-muted)"
                className={cn(isToday && "font-bold")}
              >
                {isToday ? "Today" : b.label}
              </text>
            </g>
          );
        })}
      </svg>
      <ul className="sr-only">
        {buckets.map((b) => (
          <li key={b.key}>
            {b.label}: {b.count} receipts
          </li>
        ))}
      </ul>
    </div>
  );
}
