"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";

/** Subtle entrance for dashboard sections; inert under reduced motion. */
export function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  // Always renders motion: branching on reduced motion here caused
  // hydration mismatches (server/client HTML differed).
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={fadeUp}
      transition={{ delay, duration: 0.35, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
