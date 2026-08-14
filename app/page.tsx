import Link from "next/link";
import { ArrowRight, Braces, Layers3, Search, Workflow } from "lucide-react";
import { fallbackHero, fallbackProjects } from "@/lib/defaults";
import Hero from "@/components/home/Hero";
import FeaturedProjects from "@/components/home/FeaturedProjects";
import AiWorkflow from "@/components/home/AiWorkflow";

const capabilities = [
  { icon: Search, title: "Frame the right problem", text: "Turn evidence, constraints, and business context into a clear product question and focused opportunity." },
  { icon: Workflow, title: "Design the complete journey", text: "Connect information architecture, flows, interaction states, responsive behaviour, and accessibility." },
  { icon: Layers3, title: "Build systems, not one-offs", text: "Create reusable foundations, tokens, components, and patterns that can grow with the product." },
  { icon: Braces, title: "Work close to implementation", text: "Consider data, validation, component architecture, edge cases, and feasibility while designing." },
];

export default function HomePage() {
  return (
    <>
      <Hero content={fallbackHero} />

      <FeaturedProjects projects={fallbackProjects} />

      <section className="border-y border-border-subtle bg-bg-secondary py-20 md:py-28" aria-labelledby="practice-title">
        <div className="mx-auto max-w-[var(--content-width-standard)] px-5 md:px-8">
          <p className="eyebrow">Product practice</p>
          <div className="mt-4 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <h2 id="practice-title" className="text-3xl font-semibold leading-tight tracking-tight md:text-5xl">From ambiguity to a product people can use.</h2>
              <p className="mt-5 max-w-lg text-lg leading-8 text-text-secondary">I work across the product lifecycle, making the reasoning behind the interface as clear as the interface itself.</p>
            </div>
            <div className="grid gap-px overflow-hidden rounded-2xl border border-border-subtle bg-border-subtle sm:grid-cols-2">
              {capabilities.map(({ icon: Icon, title, text }) => (
                <article key={title} className="bg-bg-primary p-6 md:p-8">
                  <Icon size={20} aria-hidden="true" className="text-text-accent" />
                  <h3 className="mt-8 text-lg font-semibold">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-text-secondary">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28" aria-labelledby="implementation-title">
        <div className="mx-auto grid max-w-[var(--content-width-standard)] gap-10 px-5 md:px-8 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="eyebrow">Design that survives implementation</p>
            <h2 id="implementation-title" className="mt-4 text-3xl font-semibold leading-tight tracking-tight md:text-5xl">Technical fluency in service of better product decisions.</h2>
          </div>
          <div className="self-end">
            <p className="text-lg leading-8 text-text-secondary">I work close to implementation, which helps me think beyond ideal-state screens. I consider component architecture, responsive behaviour, states, validation, data constraints, and engineering feasibility while designing.</p>
            <ul className="mt-8 flex flex-wrap gap-2" aria-label="Technical capabilities">
              {["HTML & CSS", "JavaScript", "TypeScript", "React", "Next.js", "APIs", "Authentication", "Git"].map((item) => <li key={item} className="rounded-full border border-border-default px-3 py-1.5 text-sm text-text-secondary">{item}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <AiWorkflow content={{
        title: "AI-enhanced product workflow",
        description: "I use AI where it improves speed, exploration, or synthesis, while keeping product decisions grounded in user evidence, business context, and design judgment.",
        steps: [
          { number: "01", title: "Synthesis", description: "Organise source material and surface themes for review—not replace evidence." },
          { number: "02", title: "Exploration", description: "Generate alternatives quickly, then evaluate them against principles and constraints." },
          { number: "03", title: "Prototyping", description: "Move from interaction hypotheses to testable product behaviour." },
          { number: "04", title: "Documentation", description: "Clarify states, decisions, and handoff details so teams can act." },
        ],
      }} />

      <section className="border-t border-border-subtle py-20 md:py-28" aria-labelledby="about-preview-title">
        <div className="mx-auto max-w-[var(--content-width-standard)] px-5 md:px-8">
          <p className="eyebrow">About</p>
          <div className="mt-4 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20">
            <h2 id="about-preview-title" className="text-3xl font-semibold leading-tight tracking-tight md:text-5xl">I design products by understanding the system around the screen.</h2>
            <div>
              <p className="text-lg leading-8 text-text-secondary">My background spans product design, research, visual communication, and technical product building. That range helps me connect user behaviour, business objectives, and implementation constraints.</p>
              <Link href="/about" className="mt-7 inline-flex min-h-11 items-center gap-2 font-medium text-text-accent hover:underline">More about how I work <ArrowRight size={17} aria-hidden="true" /></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-bg-inverse py-20 text-text-inverse md:py-28" aria-labelledby="contact-title">
        <div className="mx-auto max-w-[var(--content-width-standard)] px-5 md:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Let&apos;s build something useful</p>
          <h2 id="contact-title" className="mt-5 max-w-4xl text-3xl font-semibold leading-tight tracking-tight md:text-6xl">Interested in product design opportunities where research, systems thinking, and strong execution can turn complexity into better products.</h2>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/contact" className="inline-flex min-h-12 items-center rounded-full bg-white px-6 text-sm font-semibold text-black">Email me</Link>
            <a href="https://linkedin.com/in/meedport" target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center rounded-full border border-white/30 px-6 text-sm font-semibold text-white">LinkedIn</a>
            <Link href="/resume" className="inline-flex min-h-12 items-center rounded-full border border-white/30 px-6 text-sm font-semibold text-white">Resume</Link>
          </div>
        </div>
      </section>
    </>
  );
}
