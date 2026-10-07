"use client";

import { motion } from "framer-motion";

export function Rise({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  // Always renders motion: reduced motion is handled globally by
  // MotionProvider (branching here caused hydration mismatches).
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1], delay: Math.min(delay, 0.25) }}
    >
      {children}
    </motion.div>
  );
}
