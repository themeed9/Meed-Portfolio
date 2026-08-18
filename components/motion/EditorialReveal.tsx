"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type EditorialRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  evidence?: boolean;
  as?: "div" | "header";
};

export default function EditorialReveal({
  children,
  className,
  delay = 0,
  evidence = false,
  as = "div",
}: EditorialRevealProps) {
  const reduceMotion = useReducedMotion();
  const Component = as === "header" ? motion.header : motion.div;

  return (
    <Component
      className={className}
      initial={reduceMotion ? false : { opacity: 0.72, y: evidence ? 16 : 24, scale: evidence ? 0.985 : 1 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: evidence ? 0.12 : 0.35 }}
      transition={{ duration: evidence ? 0.7 : 0.58, delay, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </Component>
  );
}
