"use client";

import * as React from "react";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

/** Product thumbnail with a graceful icon fallback when the image is missing. */
export function ProductThumb({
  image,
  name,
  size = 56,
  className,
}: {
  image: string;
  name: string;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = React.useState(false);
  if (!image || failed) {
    return (
      <span
        aria-hidden="true"
        style={{ width: size, height: size }}
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl bg-[var(--r-primary-muted)] text-[var(--r-primary)]",
          className
        )}
      >
        <ShoppingBag style={{ width: size * 0.42, height: size * 0.42 }} />
      </span>
    );
  }
  return (
    <Image
      src={image}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      style={{ width: size, height: size }}
      className={cn("shrink-0 rounded-xl border border-line object-cover", className)}
    />
  );
}
