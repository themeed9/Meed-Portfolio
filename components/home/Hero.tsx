import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import EditorialReveal from "@/components/motion/EditorialReveal";

interface HeroContent {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  slides?: { src: string; alt: string }[];
  eyebrow?: string;
  metaLine?: string;
  identityName?: string;
  role?: string;
}

export default function Hero({ content }: { content: HeroContent }) {
  const image = content.slides?.[0];
  return (
    <section className="relative overflow-hidden" aria-labelledby="hero-name">
      <div className="hero-masthead bg-bg-inverse text-text-inverse">
        <div className="shell flex min-h-[25.75rem] items-end justify-center pb-12 pt-32 md:pb-14 md:pt-40">
          {content.identityName && (
            <EditorialReveal className="w-full text-center">
              <h1 id="hero-name" className="hero-name text-balance">{content.identityName}</h1>
            </EditorialReveal>
          )}
        </div>
      </div>

      <div className="hero-paper py-16 md:py-24">
        <div className="shell grid items-stretch gap-12 lg:grid-cols-[minmax(0,37.5rem)_minmax(0,1fr)] lg:gap-7">
          <EditorialReveal className="flex flex-col justify-center lg:pr-12">
            {(content.role || content.eyebrow) && <p className="type-small font-semibold text-text-primary">{content.role || content.eyebrow}</p>}
            <h2 id="hero-title" className="mt-5 whitespace-pre-line text-[clamp(2.5rem,4vw,3rem)] font-semibold leading-[1.04] tracking-[-0.045em] text-balance">{content.title}</h2>
            <p className="mt-7 max-w-[36rem] type-body text-text-secondary">{content.subtitle}</p>
            {content.metaLine && <p className="mt-4 type-small font-medium text-text-tertiary">{content.metaLine}</p>}
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href={content.ctaLink} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-bg-inverse px-6 type-small font-semibold text-text-inverse">{content.ctaText}<ArrowDown size={16} aria-hidden="true" /></Link>
              <Link href={content.secondaryCtaLink} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-border-strong px-6 type-small font-semibold">{content.secondaryCtaText}<ArrowUpRight size={16} aria-hidden="true" /></Link>
            </div>
          </EditorialReveal>

          {image && (
            <EditorialReveal evidence className="relative min-h-[22rem] overflow-hidden rounded-[var(--radius-md)] bg-bg-tertiary sm:min-h-[28rem] lg:min-h-[34rem]">
              <Image src={image.src} alt={image.alt} fill preload sizes="(max-width: 1023px) 100vw, 50vw" className="object-cover object-center" />
            </EditorialReveal>
          )}
        </div>
      </div>
    </section>
  );
}
