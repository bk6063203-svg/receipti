import * as React from "react";
import { ArrowDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FlowNode {
  icon: React.ReactNode;
  title: string;
  text?: string;
  highlight?: boolean;
}

/**
 * Vertical-on-mobile / horizontal-on-desktop flow diagram.
 * Used for infrastructure explanations across the landing page.
 */
export function Flow({ nodes, className }: { nodes: FlowNode[]; className?: string }) {
  return (
    <ol
      className={cn(
        "flex flex-col items-stretch gap-2 md:flex-row md:items-stretch md:justify-center",
        className
      )}
    >
      {nodes.map((node, i) => (
        <React.Fragment key={node.title}>
          {i > 0 && (
            <li aria-hidden="true" className="flex items-center justify-center md:px-1">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-[var(--r-card)] text-ink-faint">
                <ArrowDown className="h-4 w-4 md:hidden" />
                <ArrowRight className="hidden h-4 w-4 md:block" />
              </span>
            </li>
          )}
          <li
            className={cn(
              "flex flex-1 items-center gap-3.5 rounded-2xl border p-4 md:max-w-60 md:flex-col md:items-center md:p-5 md:text-center",
              node.highlight
                ? "border-[var(--r-primary)] bg-[var(--r-primary-muted)]/50 shadow-subtle"
                : "border-line bg-[var(--r-card)]"
            )}
          >
            <span
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                node.highlight
                  ? "bg-[var(--r-primary)] text-white"
                  : "bg-background text-ink"
              )}
            >
              {node.icon}
            </span>
            <span>
              <span className="block text-sm font-semibold text-ink">{node.title}</span>
              {node.text && (
                <span className="type-caption mt-1 block text-ink-muted">{node.text}</span>
              )}
            </span>
          </li>
        </React.Fragment>
      ))}
    </ol>
  );
}
