export const easeStandard: [number, number, number, number] = [0.4, 0, 0.2, 1];
export const easeEntrance: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const easeTransition: [number, number, number, number] = [0.83, 0, 0.17, 1];

export const durations = {
  micro: 0.2,
  entrance: 0.5,
  page: 0.5,
};

export const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: durations.entrance, ease: easeEntrance } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: durations.entrance, ease: easeEntrance } },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

export const pageTransitionVariants = {
  hidden: { opacity: 0, y: 12 },
  enter: { opacity: 1, y: 0, transition: { duration: durations.page, ease: easeTransition } },
  exit: { opacity: 0, y: -12, transition: { duration: durations.page, ease: easeTransition } },
};
