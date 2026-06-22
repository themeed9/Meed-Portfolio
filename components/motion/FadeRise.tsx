'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { motionVariants, ease } from '@/tokens/tokens';

type Props = {
  children: React.ReactNode;
  delay?: number;
  variant?: keyof typeof motionVariants;
  className?: string;
};

export function FadeRise({ children, delay = 0, variant = 'fadeRise', className }: Props) {
  const shouldReduceMotion = useReducedMotion();
  const v = motionVariants[variant];

  if (shouldReduceMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      className={className}
      variants={v}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay, ease: ease.out }}
    >
      {children}
    </motion.div>
  );
}
