"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { EASE_OUT } from "@/lib/motion";

export interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  id?: string;
}

/**
 * Scroll-triggered section reveal. Always renders the same tree on server
 * and client — reduced motion is handled globally by MotionProvider, which
 * disables the transform without changing the HTML (branching here caused
 * hydration mismatches). Content is never gated on animation.
 */
export function Reveal({ children, delay = 0, y = 18, className, id }: RevealProps) {
  return (
    <motion.div
      id={id}
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-72px" }}
      transition={{ duration: 0.55, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  );
}
