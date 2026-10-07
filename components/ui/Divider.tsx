import * as React from "react";
import { cn } from "@/lib/utils";

export function Divider({
  className,
  label,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { label?: string }) {
  if (!label) return <hr className={cn("hr", className)} {...rest} />;
  return (
    <div className={cn("flex items-center gap-3", className)} {...rest}>
      <hr className="hr flex-1" aria-hidden="true" />
      <span className="type-caption font-medium text-ink-faint">{label}</span>
      <hr className="hr flex-1" aria-hidden="true" />
    </div>
  );
}
