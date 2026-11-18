import FeaturedProjects from "@/components/home/FeaturedProjects";
import { AboutSection, BeyondSection, ContactBand, HomeHero, MoreWorkSection, ProjectStrip } from "@/components/home/HomeSections";
import { getHomeContent } from "@/lib/home-content-server";
import { getPublishedProductProjects, getPublishedProjects, getSiteContent } from "@/lib/portfolio-content";
import { generateMetadata } from "@/lib/seo";

// Homepage in the order of the owner's Figma "Landing — Desktop" (ADR-010 phase 5):
// hero, project strip, Selected work, More work, About, Beyond product design, Contact.
type WorkIntro = { eyebrow?: string; title?: string; description?: string };

export const dynamic = "force-dynamic";
export const metadata = generateMetadata({
  title: "Abdulhameed Abdulsalam — Product Designer",
  description: "Product Designer in Lagos designing clear, scalable products for fintech, insurance and early-stage teams.",
});

export default async function HomePage() {
  const [content, workIntro, products, everything] = await Promise.all([
    getHomeContent(),
    getSiteContent<WorkIntro>("work-page"),
    getPublishedProductProjects(),
    getPublishedProjects(),
  ]);
  const featured = products.filter((project) => project.featured);
  const selected = featured.length ? featured : products;
  const brandTiles = everything.filter((project) => project.collection === "brand");
  const heroImage = selected[0]?.homepageImage || selected[0]?.coverImage || null;

  return <>
    <HomeHero content={content.hero} fallbackImage={heroImage} />
    <ProjectStrip projects={products} />
    <FeaturedProjects intro={workIntro} projects={selected} />
    <MoreWorkSection content={content.moreWork} />
    <AboutSection content={content.about} />
    <BeyondSection content={content.beyond} brandTiles={brandTiles} />
    <ContactBand content={content.contact} />
  </>;
}
