"use client";

import * as React from "react";
import Image from "next/image";
import { Expand, Package } from "lucide-react";
import type { PosReceiptMedia } from "@/types/pos";
import { Button, Modal } from "@/components/ui";
import { cn } from "@/lib/utils";

/**
 * Merchant product thumbnail with a lightweight larger preview.
 * Falls back to a clean neutral placeholder when no media exists.
 */
export function ProductImage({ media, productName }: { media?: PosReceiptMedia[]; productName: string }) {
  const [preview, setPreview] = React.useState(false);
  const img = media?.[0];

  if (!img) {
    return (
      <span
        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-dashed border-line bg-background text-ink-faint"
        role="img"
        aria-label={`No product photo available for ${productName}`}
      >
        <Package className="h-6 w-6" aria-hidden="true" />
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setPreview(true)}
        aria-label={`Enlarge product photo of ${productName}`}
        className={cn(
          "group relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-line",
          "transition-shadow duration-200 hover:shadow-card"
        )}
      >
        <Image
          src={img.url}
          alt={img.alt}
          fill
          sizes="64px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-black/45 py-0.5 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          <Expand className="h-3 w-3" />
        </span>
      </button>

      <Modal
        open={preview}
        onClose={() => setPreview(false)}
        title={productName}
        description="Merchant-provided product photo"
        size="sm"
        footer={
          <Button variant="outline" onClick={() => setPreview(false)}>
            Close
          </Button>
        }
      >
        <div className="relative mx-auto aspect-square w-full max-w-[18rem] overflow-hidden rounded-xl border border-line">
          <Image
            src={img.url}
            alt={img.alt}
            fill
            sizes="(max-width: 640px) 80vw, 288px"
            className="object-cover"
          />
        </div>
        <p className="type-caption mt-3 text-center text-ink-faint">
          Photo supplied by the merchant to help identify the purchase.
        </p>
      </Modal>
    </>
  );
}
