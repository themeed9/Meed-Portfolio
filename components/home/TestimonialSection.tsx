"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Star } from "lucide-react";
import { fadeInUp, staggerContainer, easeEntrance } from "@/lib/motion";

interface TestimonialItem {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  content: string;
  rating: number;
}

function TestimonialCard({
  testimonial,
  index,
}: {
  testimonial: TestimonialItem;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 90%", "start 50%"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [30, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.2, 1]);

  return (
    <motion.div
      ref={ref}
      style={{ y, opacity }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="p-[var(--spacing-7)] rounded-2xl bg-surface border border-outline-variant hover:border-primary-safe/20 transition-colors duration-300"
    >
      <div className="flex gap-1 mb-[var(--spacing-4)]">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} size={14} className="fill-primary-90 text-primary-90" />
        ))}
      </div>
      <blockquote className="text-on-surface-variant text-sm leading-relaxed mb-[var(--spacing-5)]">
        &ldquo;{testimonial.content}&rdquo;
      </blockquote>
      <div>
        <p className="font-semibold text-sm text-on-surface">{testimonial.name}</p>
        {(testimonial.role || testimonial.company) && (
          <p className="text-xs text-on-surface-variant mt-0.5">
            {[testimonial.role, testimonial.company].filter(Boolean).join(", ")}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default function TestimonialSection({ testimonials }: { testimonials: TestimonialItem[] }) {
  return (
    <section className="py-[var(--spacing-12)] md:py-[var(--spacing-13)] overflow-hidden">
      <div className="max-w-[var(--content-width-wide)] mx-auto px-[var(--spacing-6)]">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mb-[var(--spacing-10)] max-w-xl"
        >
          <motion.div variants={fadeInUp}>
            <span className="text-xs font-semibold text-primary-safe uppercase tracking-widest">
              Testimonials
            </span>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="mt-3 text-4xl md:text-5xl lg:text-[var(--font-size-display-md)] font-bold leading-[var(--line-height-display)] text-on-surface"
          >
            What Clients Say
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: easeEntrance, delay: 0.4 }}
            className="mt-[var(--spacing-6)] h-[2px] w-16 bg-primary-safe origin-left"
          />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--spacing-6)]">
          {testimonials.map((t, i) => (
            <TestimonialCard key={t.id} testimonial={t} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}