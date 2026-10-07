export type NotifyKind = "sale" | "refund-requested" | "refund-completed" | "fuel";

export interface NotifyEvent {
  id: string;
  kind: NotifyKind;
  /** Short headline, e.g. "Sale completed · AED 245.00". */
  title: string;
  /** One-line detail, e.g. "Urban Threads · RCPT-DXB-0042 · CARD". */
  detail: string;
  /** Where the admin can inspect it. */
  href: string;
  at: string;
}

const EVENTS_KEY = "receipti.notify.events.v1";
const SEEN_KEY = "receipti.notify.seen.v1";
const MAX_EVENTS = 50;

function canStore(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function load(): NotifyEvent[] {
  if (!canStore()) return [];
  try {
    const raw = JSON.parse(window.localStorage.getItem(EVENTS_KEY) ?? "[]") as NotifyEvent[];
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

/** Append a transaction event (newest first, capped). Safe to call anywhere client-side. */
export function pushNotifyEvent(input: Omit<NotifyEvent, "id" | "at">): NotifyEvent {
  const event: NotifyEvent = {
    ...input,
    id: `EVT-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 1296).toString(36).toUpperCase().padStart(2, "0")}`,
    at: new Date().toISOString(),
  };
  if (canStore()) {
    try {
      window.localStorage.setItem(EVENTS_KEY, JSON.stringify([event, ...load()].slice(0, MAX_EVENTS)));
    } catch {
      /* event log is best-effort */
    }
    window.dispatchEvent(new Event("receipti:notify"));
  }
  return event;
}

/** Newest-first event log (empty until the demos produce transactions). */
export function listNotifyEvents(): NotifyEvent[] {
  return load();
}

/** Events recorded after the admin last opened the notification center. */
export function unreadNotifyCount(): number {
  if (!canStore()) return 0;
  const seenAt = window.localStorage.getItem(SEEN_KEY) ?? "";
  const events = load();
  if (!seenAt) return events.length;
  return events.filter((e) => e.at > seenAt).length;
}

export function markNotifySeen(): void {
  if (!canStore()) return;
  try {
    window.localStorage.setItem(SEEN_KEY, new Date().toISOString());
  } catch {
    /* best-effort */
  }
  window.dispatchEvent(new Event("receipti:notify"));
}
