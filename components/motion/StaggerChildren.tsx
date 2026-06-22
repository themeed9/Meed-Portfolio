'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { ease, motionVariants } from '@/tokens/tokens';

type StaggerChildrenProps = {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
};

export function StaggerChildren({ children, className, stagger = 0.08, delay = 0 }: StaggerChildrenProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            delayChildren: delay,
            staggerChildren: shouldReduceMotion ? 0 : stagger,
            ease: ease.out,
          },
        },
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
    >
      {children}
    </motion.div>
  );
}

type StaggerChildProps = {
  children: React.ReactNode;
  className?: string;
  variant?: keyof typeof motionVariants;
};

const childVariants: Record<string, Variants> = {
  fadeRise: {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  },
  slideRight: {
    hidden: { opacity: 0, x: -16 },
    visible: { opacity: 1, x: 0 },
  },
};

export function StaggerChild({ children, className, variant = 'fadeRise' }: StaggerChildProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      className={className}
      variants={childVariants[variant]}
      transition={{ duration: 0.5, ease: ease.out }}
    >
      {children}
    </motion.div>
  );
}
