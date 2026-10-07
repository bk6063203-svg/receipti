import type { Currency, Money } from "@/types";

/**
 * Formatting helpers — single place for money/date/number output
 * so every future page renders values identically.
 */

const LOCALE = "en-PK";

export function formatMoney(money: Money, opts?: { compact?: boolean }): string {
  const value = money.amountMinor / 100;
  try {
    return new Intl.NumberFormat(LOCALE, {
      style: "currency",
      currency: money.currency,
      notation: opts?.compact ? "compact" : "standard",
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${money.currency} ${(value).toFixed(2)}`;
  }
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat(LOCALE).format(value);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return `${formatDate(iso)} · ${formatTime(iso)}`;
}

export function formatCurrencyCode(currency: Currency): string {
  return currency;
}

/** "PAID" -> "Paid", "PARTIALLY_PAID" -> "Partially paid" */
export function humanizeStatus(status: string): string {
  return status
    .toLowerCase()
    .split("_")
    .map((w, i) => (i === 0 ? w[0]?.toUpperCase() + w.slice(1) : w))
    .join(" ");
}
