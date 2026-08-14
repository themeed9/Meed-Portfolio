import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Download } from "lucide-react";
import { fallbackAbout, fallbackResume, fallbackSkills } from "@/lib/defaults";
import { generateMetadata } from "@/lib/seo";

export const metadata = generateMetadata({
  title: "About",
  description: "About Abdulhameed Abdulsalam, a Product Designer connecting user behaviour, business goals, design systems, and implementation constraints.",
  slug: "about",
});

const principles = [
  ["Start with the system", "A screen only makes sense in the context of the people, rules, data, states, and business decisions around it."],
  ["Make reasoning visible", "Clear rationale, trade-offs, and evidence help teams make better decisions and keep the work honest."],
  ["Design past the happy path", "Responsive behaviour, accessibility, validation, loading, errors, and recovery are part of the product—not polish added later."],
  ["Stay close to the build", "Technical fluency helps me collaborate with engineers and design solutions that can survive implementation."],
];

export default function AboutPage() {
  return (
    <div className="pt-32 pb-24 md:pt-40">
      <div className="mx-auto max-w-[var(--content-width-standard)] px-5 md:px-8">
        <p className="eyebrow">About</p>
        <div className="mt-5 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          <div className="min-w-0">
            <h1 className="max-w-4xl text-4xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-5xl md:text-7xl">{fallbackAbout.title}</h1>
            {fallbackAbout.paragraphs.map((paragraph) => <p key={paragraph} className="mt-7 max-w-3xl text-lg leading-8 text-text-secondary">{paragraph}</p>)}
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/work" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-bg-inverse px-6 text-sm font-semibold text-text-inverse">View selected work <ArrowUpRight size={16} aria-hidden="true" /></Link>
              <a href={fallbackResume.fileUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-border-default px-6 text-sm font-semibold"><Download size={16} aria-hidden="true" /> Resume</a>
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-bg-tertiary"><Image src={fallbackAbout.imageUrl} alt="Portrait of Abdulhameed Abdulsalam" fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" /></div>
        </div>

        <section className="mt-24 border-t border-border-default pt-16" aria-labelledby="principles-title">
          <p className="eyebrow">Professional philosophy</p>
          <h2 id="principles-title" className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl">How I approach product work.</h2>
          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-border-subtle bg-border-subtle md:grid-cols-2">
            {principles.map(([title, text], index) => <article key={title} className="bg-bg-primary p-7 md:p-9"><p className="text-sm tabular-nums text-text-tertiary">0{index + 1}</p><h3 className="mt-8 text-xl font-semibold">{title}</h3><p className="mt-3 leading-7 text-text-secondary">{text}</p></article>)}
          </div>
        </section>

        <section className="mt-24 border-t border-border-default pt-16" aria-labelledby="capabilities-title">
          <p className="eyebrow">Capabilities</p><h2 id="capabilities-title" className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">Product depth, supported by technical breadth.</h2>
          <div className="mt-10 grid gap-10 md:grid-cols-2">
            {["Product practice", "Technical fluency"].map((category) => <div key={category}><h3 className="text-sm font-semibold uppercase tracking-wider text-text-tertiary">{category}</h3><ul className="mt-5 divide-y divide-border-subtle border-y border-border-subtle">{fallbackSkills.filter((skill) => skill.category === category).map((skill) => <li key={skill.id} className="py-4 font-medium">{skill.name}</li>)}</ul></div>)}
          </div>
        </section>
      </div>
    </div>
  );
}
