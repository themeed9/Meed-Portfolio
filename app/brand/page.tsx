import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ContactBand } from "@/components/home/HomeSections";
import { getBrandPageContent, getContactContent } from "@/lib/home-content-server";
import { getPublishedProjects } from "@/lib/portfolio-content";
import { generateMetadata as genMeta } from "@/lib/seo";

// Figma "Brand and Graphic Design — Page" (ADR-010 phase 5). Lists published projects whose
// collection is "brand"; each opens the shared case-study route, so no page per project.
export const dynamic = "force-dynamic";
export async function generateMetadata() {
  const page = await getBrandPageContent();
  return genMeta({ title: page.title, description: page.intro, slug: "brand" });
}

export default async function BrandPage() {
  const [page, contact, projects] = await Promise.all([getBrandPageContent(), getContactContent(), getPublishedProjects()]);
  const brand = projects.filter((project) => project.collection === "brand");
  return <>
    <section className="home-section brand-intro" aria-labelledby="brand-title">
      <div className="home-shell">
        <Link href="/#beyond" className="home-text-link mt-0"><ArrowLeft size={16} aria-hidden="true" /> {page.backText}</Link>
        <p className="home-label mt-6">{page.label}</p>
        <h1 id="brand-title" className="brand-title">{page.title}</h1>
        <p className="brand-intro-text">{page.intro}</p>
      </div>
    </section>
    <section className="home-section pt-0" aria-label="Brand projects">
      <div className="home-shell">
        {brand.length ? (
          <ul className="brand-grid">
            {brand.map((project) => {
              const src = project.homepageImage || project.coverImage;
              return (
                <li key={project.id}>
                  <Link href={`/work/${project.slug}`} className="brand-card">
                    <span className="brand-card-image">
                      {src && <Image src={src} alt={`${project.title} brand work`} fill sizes="(max-width: 767px) 100vw, 544px" className="object-cover" />}
                    </span>
                    <span className="brand-card-title">{project.title}</span>
                    <span className="brand-card-context">{project.recruiterSummary || project.category}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="brand-empty">{page.emptyText}</p>
        )}
      </div>
    </section>
    <ContactBand content={contact} />
  </>;
}
