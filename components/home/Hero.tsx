import Image from "next/image";
import Link from "next/link";
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
  const identityParts = content.identityName?.trim().split(/\s+/) ?? [];
  const familyName = identityParts.length > 1 ? identityParts.at(-1) : undefined;
  const givenNames = familyName ? identityParts.slice(0, -1).join(" ") : identityParts.join(" ");

  return (
    <section className="hero-a relative overflow-hidden" aria-labelledby="hero-name">
      <div className="hero-masthead">
        <div className="hero-masthead-inner">
          {content.identityName && (
            <EditorialReveal className="w-full text-center">
              <h1 id="hero-name" className="hero-name">
                <span>{givenNames}</span>
                {familyName && <> <span className="hero-name-family">{familyName}</span></>}
              </h1>
            </EditorialReveal>
          )}
        </div>
      </div>

      <div className="hero-paper">
        <div className={`hero-a-shell hero-a-grid ${image ? "" : "hero-a-grid-single"}`}>
          <div className="hero-copy">
            {(content.role || content.eyebrow) && (
              <EditorialReveal delay={0.06}>
                <p className="hero-role">{content.role || content.eyebrow}</p>
              </EditorialReveal>
            )}
            <EditorialReveal delay={0.12}>
              <div className="hero-statement">
                <h2 id="hero-title" className="hero-title">{content.title}</h2>
                <p className="hero-supporting">{content.subtitle}</p>
                {content.metaLine && <p className="hero-meta">{content.metaLine}</p>}
              </div>
            </EditorialReveal>
            <EditorialReveal delay={0.18}>
              <div className="hero-actions">
                <Link href={content.ctaLink} className="hero-action-primary">{content.ctaText}</Link>
                <Link href={content.secondaryCtaLink} className="hero-action-text">{content.secondaryCtaText}</Link>
              </div>
            </EditorialReveal>
          </div>

          {image && (
            <EditorialReveal evidence delay={0.18} className="hero-evidence">
              <Image src={image.src} alt={image.alt} fill preload sizes="(max-width: 767px) 0px, (max-width: 1439px) 48vw, 619px" className="object-cover object-center" />
            </EditorialReveal>
          )}
        </div>
      </div>
    </section>
  );
}
