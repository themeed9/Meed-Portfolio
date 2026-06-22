'use client';

export const colors = {
  navy: '#0A1F2E',
  gold: '#C9A84C',
  white: '#FFFFFF',
  mist: '#A8B2BB',
  fog: '#5A6A76',
  glassBg: 'rgba(255, 255, 255, 0.03)',
  glassBorder: 'rgba(255, 255, 255, 0.12)',
};

export const typography = {
  fontDisplay: "'Inter Display', 'Inter', sans-serif",
  fontBody: "'Inter', sans-serif",
  weightLight: 300,
  weightRegular: 400,
  weightMedium: 500,
  sizeXs: '11px',
  sizeSm: '13px',
  sizeMd: '15px',
  sizeLg: '18px',
  sizeXl: '28px',
  leadingSnug: 1.15,
  leadingRelaxed: 1.7,
  trackingSnug: '-0.02em',
  trackingWide: '0.08em',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
  '2xl': 64,
  '3xl': 96,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 32,
  full: 9999,
};

export const ease = {
  out: [0.22, 1, 0.36, 1] as [number, number, number, number],
  inOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
};

export const duration = {
  fast: 0.25,
  normal: 0.4,
  slow: 0.6,
};

export const parallax = {
  slow: 0.15,
  medium: 0.3,
  fast: 0.5,
};

export const motionVariants = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  fadeRise: {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  },
  scaleUp: {
    hidden: { opacity: 0, scale: 0.96 },
    visible: { opacity: 1, scale: 1 },
  },
  slideRight: {
    hidden: { opacity: 0, x: -16 },
    visible: { opacity: 1, x: 0 },
  },
};

export const hoverVariants = {
  press: { scale: 0.97 },
  pressSmall: { scale: 0.94 },
  lift: { y: -2 },
};
