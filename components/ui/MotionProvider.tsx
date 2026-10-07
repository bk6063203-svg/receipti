"use client";

import * as React from "react";
import { MotionConfig } from "framer-motion";

/**
 * Global animation policy. `reducedMotion="user"` lets framer-motion disable
 * transform/layout animations for reduced-motion users WITHOUT branching the
 * rendered tree — branching on `useReducedMotion()` during render produces
 * different server/client HTML and breaks hydration.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
