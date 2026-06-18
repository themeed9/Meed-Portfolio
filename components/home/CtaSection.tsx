"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { easeEntrance } from "@/lib/motion";

export default function CtaSection({ ctaBgUrl }: { ctaBgUrl?: string | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "start 50%"],
  });

  const bgScale = useTransform(scrollYProgress, [0, 1], [0.98, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.5, 1]);

  const text = "Let's Build Something Great Together";
  const words = text.split(" ");

  return (
    <section className="relative py-[var(--spacing-14)] md:py-[var(--spacing-15)] overflow-hidden">
      {ctaBgUrl ? (
        <motion.div
          ref={ref}
          style={{ scale: bgScale }}
          className="absolute inset-0 rounded-3xl mx-[var(--spacing-6)] origin-center overflow-hidden"
        >
          <Image src={ctaBgUrl} alt="" fill className="object-cover" />
          <div className="absolute inset-0 bg-neutral-950/70" aria-hidden="true" />
        </motion.div>
      ) : (
        <motion.div
          ref={ref}
          style={{ scale: bgScale, opacity }}
          className="absolute inset-0 bg-neutral-950 rounded-3xl mx-[var(--spacing-6)] origin-center"
        />
      )}
      <div className="relative z-10 max-w-[var(--content-width-wide)] mx-auto px-[var(--spacing-6)] text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl lg:text-[var(--font-size-display-md)] font-bold leading-[var(--line-height-display)]" style={{ color: "#fff" }}>
            {words.map((word, i) => (
              <span key={i} className="inline-block overflow-hidden">
                <motion.span
                  className="inline-block"
                  style={{ color: "#fff" }}
                  initial={{ y: "100%", opacity: 0 }}
                  whileInView={{ y: "0%", opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    ease: easeEntrance,
                    delay: i * 0.04,
                  }}
                >
                  {word}
                </motion.span>
                {i < words.length - 1 && "\u00A0"}
              </span>
            ))}
          </h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-[var(--spacing-4)] text-lg text-[rgba(255,255,255,0.8)] max-w-lg mx-auto leading-relaxed"
          >
            Have a project in mind? Let&apos;s talk about how I can help bring your vision to life.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.55 }}
          >
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 mt-[var(--spacing-8)] px-6 py-3 bg-[#fff] text-neutral-950 rounded-full text-sm font-medium hover:opacity-90 transition-all duration-300 cursor-pointer group"
            >
              Start a Conversation
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}