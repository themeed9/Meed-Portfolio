import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, Download } from "lucide-react";

interface HeroContent {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  slides?: { src: string; alt: string }[];
}

export default function Hero({ content }: { content: HeroContent }) {
  const image = content.slides?.[0];
  return (
    <section className="relative overflow-hidden pt-32 md:pt-40" aria-labelledby="hero-title">
      <div className="mx-auto max-w-[var(--content-width-standard)] px-5 md:px-8">
        <p className="eyebrow">Product Designer</p>
        <h1 id="hero-title" className="mt-5 max-w-5xl text-[clamp(2.75rem,7vw,6.8rem)] font-semibold leading-[0.98] tracking-[-0.055em] text-text-primary">{content.title}</h1>
        <div className="mt-8 grid gap-8 border-t border-border-subtle pt-7 md:mt-12 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="max-w-3xl text-lg leading-8 text-text-secondary md:text-xl">{content.subtitle}</p>
            <p className="mt-5 text-sm font-medium text-text-tertiary">Fintech · SaaS · UX Research · Product Strategy · Design Systems · Mobile & Web</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={content.ctaLink} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-bg-inverse px-6 text-sm font-semibold text-text-inverse">{content.ctaText}<ArrowDownRight size={17} aria-hidden="true" /></Link>
            <Link href={content.secondaryCtaLink} className="inline-flex min-h-12 items-center rounded-full border border-border-default px-6 text-sm font-semibold">{content.secondaryCtaText}</Link>
            <Link href="/resume" aria-label="View resume" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-border-default px-5 text-sm font-semibold"><Download size={16} aria-hidden="true" /> Resume</Link>
          </div>
        </div>
        {image && <div className="relative mt-12 aspect-[16/8] overflow-hidden rounded-t-2xl bg-bg-tertiary md:mt-16"><Image src={image.src} alt={image.alt} fill preload sizes="(max-width: 1200px) 100vw, 1200px" className="object-cover object-top" /></div>}
      </div>
    </section>
  );
}
