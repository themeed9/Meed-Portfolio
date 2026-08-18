import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Download } from "lucide-react";
import { generateMetadata } from "@/lib/seo";
import { getResume, getSiteContent, getSkills } from "@/lib/portfolio-content";

export const dynamic = "force-dynamic";
export const metadata = generateMetadata({ title:"About", description:"About Abdulhameed Abdulsalam.", slug:"about" });
type AboutContent = { title:string; paragraphs:string[]; imageUrl?:string; principles?:{title:string;text:string}[]; workingStyle?:string[] };
type Settings = { aboutImage?:string|null };

export default async function AboutPage() {
  const [about,settings,skills,resume]=await Promise.all([getSiteContent<AboutContent>("homepage-about"),getSiteContent<Settings>("site-settings"),getSkills(),getResume()]);
  if (!about) return <div className="page-pad"><div className="shell"><p className="type-body text-text-secondary">About content has not been published yet.</p></div></div>;
  const image=settings?.aboutImage||about.imageUrl;
  return <div className="page-pad"><div className="shell"><p className="eyebrow">About</p><div className="mt-5 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20"><div><h1 className="type-h1">{about.title}</h1>{about.paragraphs.map(paragraph=><p key={paragraph} className="mt-7 max-w-3xl type-body-lg text-text-secondary">{paragraph}</p>)}<div className="mt-9 flex flex-wrap gap-3"><Link href="/work" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-bg-inverse px-6 type-small font-semibold text-text-inverse">View selected work <ArrowUpRight size={16} aria-hidden="true" /></Link>{resume&&<a href={resume.fileUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-border-default px-6 type-small font-semibold"><Download size={16} aria-hidden="true"/> Resume</a>}</div></div>{image&&<div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-md)] bg-bg-tertiary"><Image src={image} alt="Portrait of Abdulhameed Abdulsalam" fill sizes="(max-width:1024px) 100vw,40vw" className="object-cover"/></div>}</div>
    {about.principles?.length&&<section className="mt-24 border-t border-border-default pt-16" aria-labelledby="principles"><p className="eyebrow">Professional philosophy</p><h2 id="principles" className="mt-4 type-h2">How I approach product work.</h2><div className="mt-10 grid gap-8 md:grid-cols-2">{about.principles.map((principle,index)=><article key={principle.title} className="border-t border-border-subtle pt-5"><p className="type-micro text-text-tertiary">0{index+1}</p><h3 className="mt-5 type-h3">{principle.title}</h3><p className="mt-3 type-body text-text-secondary">{principle.text}</p></article>)}</div></section>}
    {skills.length>0&&<section id="capabilities" className="mt-24 border-t border-border-default pt-16"><p className="eyebrow">Capabilities</p><div className="mt-10 grid gap-10 md:grid-cols-2">{Array.from(new Set(skills.map(skill=>skill.category))).map(category=><div key={category}><h2 className="type-h3">{category}</h2><ul className="mt-5 divide-y divide-border-subtle border-y border-border-subtle">{skills.filter(skill=>skill.category===category).map(skill=><li key={skill.id} className="py-4 font-medium">{skill.name}</li>)}</ul></div>)}</div></section>}
  </div></div>;
}
