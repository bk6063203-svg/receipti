"use client";

import { useRouter } from "next/navigation";
import { QrCode } from "lucide-react";
import { Button, Modal } from "@/components/ui";

function Corner({ className }: { className?: string }) {
  return <span aria-hidden="true" className={`absolute h-8 w-8 border-[3px] border-[var(--r-accent)] ${className ?? ""}`} />;
}

/** Simulated QR scan — no camera permissions in this prototype. */
export function ScanModal({
  open,
  onClose,
  onManual,
}: {
  open: boolean;
  onClose: () => void;
  onManual: () => void;
}) {
  const router = useRouter();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Scan Receipti QR"
      description="Align the QR code inside the scanning frame."
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onManual}>
            Enter reference instead
          </Button>
          <Button
            onClick={() => {
              onClose();
              router.push("/verify/RCP_8F42K9M2");
            }}
            leftIcon={<QrCode className="h-4 w-4" aria-hidden="true" />}
          >
            Use demo receipt
          </Button>
        </>
      }
    >
      <div className="relative mx-auto aspect-square w-full max-w-[16rem] overflow-hidden rounded-2xl bg-[var(--r-dark)]" role="img" aria-label="Simulated QR scanner frame">
        <div className="bg-blueprint absolute inset-0 opacity-20" aria-hidden="true" />
        {/* Scan line */}
        <span aria-hidden="true" className="animate-scan-y absolute inset-x-8 top-4 h-0.5 rounded bg-[var(--r-accent)] shadow-[0_0_12px_var(--r-accent)]" />
        {/* Frame corners */}
        <div aria-hidden="true" className="absolute inset-10">
          <Corner className="left-0 top-0 rounded-tl-xl border-b-0 border-r-0" />
          <Corner className="right-0 top-0 rounded-tr-xl border-b-0 border-l-0" />
          <Corner className="bottom-0 left-0 rounded-bl-xl border-r-0 border-t-0" />
          <Corner className="bottom-0 right-0 rounded-br-xl border-l-0 border-t-0" />
        </div>
        <QrCode className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 text-[var(--r-on-dark-muted)]" aria-hidden="true" />
      </div>
      <p className="type-caption mt-3 text-center text-ink-faint">
        Prototype simulation — no camera is accessed. A real scan opens the receipt reference.
      </p>
    </Modal>
  );
}
