"use client";

import * as React from "react";
import { AlertTriangle, Info } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "info";
  loading?: boolean;
}

/** Confirmation dialog built on Modal. */
export function Dialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "info",
  loading = false,
}: DialogProps) {
  const Icon = tone === "danger" ? AlertTriangle : Info;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-3">
        <span
          className={
            tone === "danger"
              ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--r-danger-muted)] text-[var(--r-danger)]"
              : "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--r-primary-muted)] text-[var(--r-primary)]"
          }
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="type-small text-ink-muted">{description}</p>
      </div>
    </Modal>
  );
}
