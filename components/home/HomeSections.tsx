import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { Beyond, HomeAbout, HomeContact, HomeHero, HomeMedia as HomeMediaValue, MoreWork } from "@/lib/home-content";
import { HERO_BACKGROUND, isExternal, safeHref } from "@/lib/home-content";
import StripScroller from "./StripScroller";
import HomeMedia from "./HomeMedia";

// Homepage sections from the owner's Figma "Landing — Desktop" (ADR-010 phase 5).
// Server components only: everything is visible on first paint, no motion.

type StripProject = { id: string; title: string; slug: string; homepageImage?: string | null; coverImage?: string | null };
type BrandTile = { id: string; title: string; slug: string; coverImage?: string | null; homepageImage?: string | null };

function SmartLink({ href, className, children, ariaLabel }: { href: string; className?: string; children: React.ReactNode; ariaLabel?: string }) {
  if (isExternal(href)) return <a href={href} className={className} target="_blank" rel="noreferrer" aria-label={ariaLabel}>{children}</a>;
  return <Link href={href} className={className} aria-label={ariaLabel}>{children}</Link>;
}

/**
 * One continuous sky behind the transparent header, the hero and the project strip (owner request):
 * no divider between them, fading into the page colour at the bottom. The photo is decorative; the
 * washes keep all text on it at WCAG AA (checked by the hero contrast audit).
 */
export function HomeSky({ background, children }: { background?: HomeHero["background"]; children: React.ReactNode }) {
  const photo = background ?? HERO_BACKGROUND;
  return (
    <div className="home-sky">
      <div className="home-hero-bg" aria-hidden="true">
        <Image src={photo.src} alt="" fill priority sizes="100vw" className="object-cover object-[50%_30%]" />
        <div className="home-sky-fade" />
      </div>
      {children}
    </div>
  );
}

export function HomeHero({ content, fallbackImage }: { content: HomeHero; fallbackImage?: string | null }) {
  const cta = safeHref(content.ctaLink) ?? "#selected-work";
  const roles = safeHref(content.rolesLink);
  const image = content.image ?? (fallbackImage ? { src: fallbackImage, alt: "Product interface from a featured case study" } : null);
  return (
    <section className="home-hero home-hero--photo" aria-labelledby="home-hero-title">
      <div className="home-shell home-hero-grid">
        <div className="min-w-0">
          <p className="home-status"><span className="home-status-dot" aria-hidden="true" />{content.status}</p>
          <h1 id="home-hero-title" className="home-hero-title">{content.headline}</h1>
          <p className="home-hero-intro">{content.intro}</p>
          <div className="home-hero-actions">
            <SmartLink href={cta} className="home-button home-button-primary">{content.ctaText}</SmartLink>
            {content.rolesText && (roles
              ? <SmartLink href={roles} className="home-roles-link">{content.rolesText} <ArrowRight size={16} aria-hidden="true" /></SmartLink>
              : <p className="home-roles-link">{content.rolesText}</p>)}
          </div>
        </div>
        {image && (
          <div className="home-hero-media">
            <HomeMedia media={image} sizes="(max-width: 767px) 100vw, 560px" fit="contain" />
          </div>
        )}
      </div>
    </section>
  );
}

type StripTile = { title: string; note: string; href?: string; media?: HomeMediaValue };

export function ProjectStrip({ projects, placeholders }: { projects: StripProject[]; placeholders: StripTile[] }) {
  if (!projects.length && !placeholders.length) return null;
  return (
    <section className="home-strip" aria-label="All projects">
      <StripScroller label="Projects, scroll sideways for more">
        {projects.map((project) => {
          const src = project.homepageImage || project.coverImage;
          return (
            <li key={project.id} className="home-strip-item">
              <Link href={`/work/${project.slug}`} className="home-strip-link">
                <span className="home-strip-preview">
                  {src && <Image src={src} alt="" fill sizes="260px" className="object-cover" />}
                </span>
                <span className="home-strip-label">{project.title}</span>
              </Link>
            </li>
          );
        })}
        {placeholders.map((item) => {
          // Extra tile (Admin → Content → Project carousel): its own image or video, or a wireframe.
          const href = safeHref(item.href);
          const inner = (
            <>
              {item.media
                ? <span className="home-strip-preview"><HomeMedia media={item.media} sizes="260px" /></span>
                : <span className="home-strip-preview home-strip-wireframe" aria-hidden="true"><span /><span /><span /></span>}
              <span className="home-strip-label">{item.title} <span className="home-strip-note">{item.note}</span></span>
            </>
          );
          return (
            <li key={`tile-${item.title}`} className="home-strip-item">
              {href ? <SmartLink href={href} className="home-strip-link">{inner}</SmartLink> : <div className="home-strip-link">{inner}</div>}
            </li>
          );
        })}
      </StripScroller>
    </section>
  );
}

export function MoreWorkSection({ content }: { content: MoreWork }) {
  if (!content.items.length) return null;
  return (
    <section className="home-section" aria-labelledby="more-work-title">
      <div className="home-shell">
        <h2 id="more-work-title" className="home-label">{content.label}</h2>
        <ul className="home-index">
          {content.items.map((item) => {
            const href = safeHref(item.href);
            const row = <>{item.media && <span className="home-index-thumb"><HomeMedia media={item.media} sizes="96px" /></span>}<span className="home-index-title">{item.title}</span><span className="home-index-context">{item.description}</span>{href && <ArrowRight size={18} className="home-index-arrow" aria-hidden="true" />}</>;
            return <li key={item.title}>{href ? <SmartLink href={href} className="home-index-row">{row}</SmartLink> : <div className="home-index-row">{row}</div>}</li>;
          })}
        </ul>
      </div>
    </section>
  );
}

export function AboutSection({ content }: { content: HomeAbout }) {
  return (
    <section id="about" className="home-section scroll-mt-20" aria-labelledby="about-title">
      <div className="home-shell home-about-grid">
        <h2 id="about-title" className="home-label">{content.label}</h2>
        <p className="home-about-statement">{content.statement}</p>
        {content.image && (
          <div className="home-about-photo">
            <HomeMedia media={content.image} sizes="(max-width: 767px) 100vw, 480px" className="object-top" />
          </div>
        )}
      </div>
    </section>
  );
}

export function BeyondSection({ content, brandTiles }: { content: Beyond; brandTiles: BrandTile[] }) {
  const legacyVideo = safeHref(content.ai.videoUrl);
  const aiMedia: HomeMediaValue | null = content.ai.media ?? (legacyVideo && /^https:\/\//i.test(legacyVideo) ? { src: legacyVideo, alt: `${content.ai.title} episode`, kind: "video" } : null);
  const tiles = brandTiles.slice(0, 3);
  return (
    <section id="beyond" className="home-section scroll-mt-20" aria-labelledby="beyond-title">
      <div className="home-shell">
        <h2 id="beyond-title" className="home-label">{content.label}</h2>
        <div className="home-beyond-rows">
          <article className="home-beyond-row">
            <div className="min-w-0">
              <p className="home-beyond-meta">{content.ai.label}</p>
              <h3 className="home-beyond-title">{content.ai.title}</h3>
              <p className="home-beyond-body">{content.ai.body}</p>
            </div>
            <div className="home-media-frame">
              {aiMedia
                ? <HomeMedia media={aiMedia} sizes="(max-width: 767px) 100vw, 520px" controls />
                : <p className="home-media-caption">{content.ai.videoCaption}</p>}
            </div>
          </article>
          <article className="home-beyond-row">
            <div className="min-w-0">
              <p className="home-beyond-meta">{content.founder.label}</p>
              <h3 className="home-beyond-title">{content.founder.title}</h3>
              <p className="home-beyond-body">{content.founder.body}</p>
              {content.founder.media && content.founder.interests && <p className="home-beyond-body">{content.founder.interests}</p>}
            </div>
            {content.founder.media
              ? <div className="home-media-frame"><HomeMedia media={content.founder.media} sizes="(max-width: 767px) 100vw, 520px" /></div>
              : content.founder.interests && <p className="home-beyond-body self-center">{content.founder.interests}</p>}
          </article>
          <article className="home-beyond-row">
            <div className="min-w-0">
              <p className="home-beyond-meta">{content.brand.label}</p>
              <h3 className="home-beyond-title">{content.brand.title}</h3>
              <p className="home-beyond-body">{content.brand.body}</p>
              <Link href="/brand" className="home-text-link">{content.brand.linkText} <ArrowRight size={16} aria-hidden="true" /></Link>
            </div>
            {tiles.length > 0 && (
              <ul className="home-teasers" aria-label="Brand work">
                {tiles.map((tile) => {
                  const src = tile.homepageImage || tile.coverImage;
                  return (
                    <li key={tile.id}>
                      <Link href={`/work/${tile.slug}`} className="home-teaser">
                        {src && <Image src={src} alt="" fill sizes="200px" className="object-cover" />}
                        <span className="home-teaser-caption">{tile.title}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </article>
        </div>
      </div>
    </section>
  );
}

export function ContactBand({ content }: { content: HomeContact }) {
  const github = safeHref(content.githubUrl);
  const resume = safeHref(content.resumeUrl);
  return (
    <section id="contact" className="home-contact scroll-mt-20" aria-labelledby="contact-title">
      <div className="home-shell">
        <h2 id="contact-title" className="home-contact-title">{content.headline}</h2>
        <div className="home-contact-actions">
          {content.email && (
            <a href={`mailto:${content.email}`} className="home-button home-button-primary">Email {content.email}</a>
          )}
          {github && <SmartLink href={github} className="home-button home-button-on-dark">GitHub <ArrowUpRight size={16} aria-hidden="true" /></SmartLink>}
          {resume && <SmartLink href={resume} className="home-button home-button-on-dark">Résumé</SmartLink>}
        </div>
      </div>
    </section>
  );
}
