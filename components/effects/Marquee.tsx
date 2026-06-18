"use client";

interface MarqueeProps {
  items: string[];
  className?: string;
  speed?: number;
  pauseOnHover?: boolean;
}

export default function Marquee({
  items,
  className = "",
  speed = 30,
  pauseOnHover = true,
}: MarqueeProps) {
  const duplicated = [...items, ...items, ...items, ...items];

  return (
    <div className={`overflow-hidden py-[var(--spacing-8)] ${className}`} aria-hidden="true">
      <div
        className="flex gap-[var(--spacing-10)] whitespace-nowrap"
        style={{
          animation: `marquee ${speed}s linear infinite`,
          width: "max-content",
        }}
        onMouseEnter={pauseOnHover ? (e) => (e.currentTarget.style.animationPlayState = "paused") : undefined}
        onMouseLeave={pauseOnHover ? (e) => (e.currentTarget.style.animationPlayState = "running") : undefined}
      >
        {duplicated.map((item, i) => (
          <span
            key={i}
            className="text-[var(--font-size-display-sm)] md:text-[var(--font-size-display-md)] font-bold text-outline-variant/30 uppercase tracking-wider flex items-center gap-[var(--spacing-6)]"
          >
            {item}
            <span className="w-2 h-2 rounded-full bg-primary/40 flex-shrink-0" aria-hidden="true" />
          </span>
        ))}
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
