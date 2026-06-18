"use client";

import { motion, useReducedMotion } from "framer-motion";
import { fadeInUp, fadeIn } from "@/lib/motion";

export default function FadeIn({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const prefersReduced = useReducedMotion();
  const variants = prefersReduced ? fadeIn : fadeInUp;

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
