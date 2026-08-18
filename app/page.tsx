import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Hero from "@/components/home/Hero";
import FeaturedProjects from "@/components/home/FeaturedProjects";
import { getPublishedProjects, getSiteContent, getSkills } from "@/lib/portfolio-content";

type HeroContent = { title:string; subtitle:string; ctaText:string; ctaLink:string; secondaryCtaText:string; secondaryCtaLink:string; slides?:{src:string;alt:string}[]; eyebrow?:string; metaLine?:string; identityName?:string; role?:string };
type WorkIntro = { eyebrow?:string; title?:string; description?:string };
type AboutContent = { title:string; paragraphs:string[] };
type WorkflowContent = { title:string; description:string; steps:{number:string;title:string;description:string}[] };
type CtaContent = { eyebrow?:string; title:string; primaryLabel?:string; secondaryLabel?:string };

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [hero, about, workflow, cta, workIntro, projects, skills] = await Promise.all([
    getSiteContent<HeroContent>("homepage-hero"), getSiteContent<AboutContent>("homepage-about"),
    getSiteContent<WorkflowContent>("homepage-workflow"), getSiteContent<CtaContent>("homepage-cta"), getSiteContent<WorkIntro>("work-page"),
    getPublishedProjects(), getSkills(),
  ]);
  const featured = projects.filter(project => project.featured);
  return <>
    {hero && <Hero content={hero} />}
    <FeaturedProjects intro={workIntro} projects={(featured.length ? featured : projects).map(project => ({ ...project, coverImage: project.homepageImage || project.coverImage, description: project.recruiterSummary || project.description }))} />
    {skills.length > 0 && <section className="border-y border-border-subtle bg-bg-secondary section-pad" aria-labelledby="capability-title"><div className="shell"><p className="eyebrow">Capabilities</p><h2 id="capability-title" className="mt-4 type-h2">Product depth supported by systems thinking.</h2><div className="mt-10 grid gap-10 md:grid-cols-2">{Array.from(new Set(skills.map(skill => skill.category))).map(category => <section key={category}><h3 className="type-h3">{category}</h3><ul className="mt-5 divide-y divide-border-subtle border-y border-border-subtle">{skills.filter(skill => skill.category === category).map(skill => <li key={skill.id} className="py-4 type-body">{skill.name}</li>)}</ul></section>)}</div></div></section>}
    {workflow && <section className="section-pad" aria-labelledby="workflow-title"><div className="shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20"><div><p className="eyebrow">Workflow</p><h2 id="workflow-title" className="mt-4 type-h2">{workflow.title}</h2><p className="mt-5 type-body text-text-secondary">{workflow.description}</p></div><div className="grid gap-8 sm:grid-cols-2">{workflow.steps.map(step => <article key={step.number} className="border-t border-border-default pt-5"><p className="type-micro text-text-tertiary">{step.number}</p><h3 className="mt-5 type-h3">{step.title}</h3><p className="mt-3 type-body text-text-secondary">{step.description}</p></article>)}</div></div></section>}
    {about && <section className="border-t border-border-subtle section-pad" aria-labelledby="about-preview-title"><div className="shell"><p className="eyebrow">About</p><div className="mt-4 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20"><h2 id="about-preview-title" className="type-h2">{about.title}</h2><div><p className="type-body-lg text-text-secondary">{about.paragraphs[0]}</p><Link href="/about" className="mt-7 inline-flex min-h-11 items-center gap-2 font-medium text-text-accent">More about how I work <ArrowRight size={17} aria-hidden="true" /></Link></div></div></div></section>}
    {cta && <section className="bg-bg-inverse section-pad text-text-inverse" aria-labelledby="home-cta"><div className="shell"><p className="type-micro text-white/60">{cta.eyebrow}</p><h2 id="home-cta" className="mt-5 max-w-4xl type-h2">{cta.title}</h2><div className="mt-9 flex flex-wrap gap-3"><Link href="/contact" className="inline-flex min-h-12 items-center rounded-full bg-white px-6 type-small font-semibold text-black">{cta.primaryLabel || "Contact"}</Link><Link href="/resume" className="inline-flex min-h-12 items-center rounded-full border border-white/30 px-6 type-small font-semibold">{cta.secondaryLabel || "Resume"}</Link></div></div></section>}
  </>;
}
