"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { scaleIn, useReducedMotion } from "@/lib/motion";
import { IconButton } from "./IconButton";
import { useMounted } from "@/hooks/use-mounted";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  labelledBy?: string;
}

const SIZES = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
} as const;

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: ModalProps) {
  const mounted = useMounted();
  const reduceMotion = useReducedMotion();
  const titleId = React.useId();
  const descId = React.useId();
  const panelRef = React.useRef<HTMLDivElement>(null);
  const prevFocus = React.useRef<HTMLElement | null>(null);

  // Scroll lock + focus management
  React.useEffect(() => {
    if (!open) return;
    prevFocus.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    const panel = panelRef.current;
    panel?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      // Simple focus trap
      if (e.key === "Tab" && panel) {
        const focusables = panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0]!;
        const last = focusables[focusables.length - 1]!;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      prevFocus.current?.focus?.();
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.18 }}
          role="presentation"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/45" aria-hidden="true" />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descId : undefined}
            tabIndex={-1}
            variants={reduceMotion ? undefined : scaleIn}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, scale: 0.97 }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "relative flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-2xl bg-[var(--r-card)] shadow-pop",
              SIZES[size]
            )}
          >
            <div className="flex items-start justify-between gap-4 border-b border-line p-5 sm:p-6">
              <div>
                <h2 id={titleId} className="type-h3">
                  {title}
                </h2>
                {description && (
                  <p id={descId} className="type-small mt-1 text-ink-muted">
                    {description}
                  </p>
                )}
              </div>
              <IconButton label="Close dialog" onClick={onClose}>
                <X className="h-5 w-5" aria-hidden="true" />
              </IconButton>
            </div>
            <div className="overflow-y-auto p-5 sm:p-6">{children}</div>
            {footer && (
              <div className="flex flex-col-reverse gap-2 border-t border-line p-5 sm:flex-row sm:justify-end sm:p-6">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
