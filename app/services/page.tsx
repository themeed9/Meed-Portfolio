import { prisma } from "@/lib/prisma";
import { fallbackServices } from "@/lib/defaults";
import { generateMetadata } from "@/lib/seo";
import FadeIn from "@/components/effects/FadeIn";
import { Palette, PenTool, Layers, Zap, Sparkles, Megaphone } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = generateMetadata({
  title: "Services",
  description: "Product design, UI/UX design, design systems, AI-enhanced prototyping, brand identity, and marketing design services.",
});

const iconMap: Record<string, React.ReactNode> = {
  Palette: <Palette size={24} />,
  PenTool: <PenTool size={24} />,
  Layers: <Layers size={24} />,
  Zap: <Zap size={24} />,
  Sparkles: <Sparkles size={24} />,
  Megaphone: <Megaphone size={24} />,
};

export default async function ServicesPage() {
  const services = await prisma.service.findMany({ orderBy: { order: "asc" } }).catch(() => fallbackServices);

  return (
    <FadeIn className="pt-[var(--spacing-13)] pb-[var(--spacing-12)]">
      <div className="max-w-[var(--content-width-wide)] mx-auto px-[var(--spacing-6)]">
        <div className="max-w-2xl mb-[var(--spacing-12)]">
          <span className="text-xs font-semibold text-text-accent uppercase tracking-widest">
            Services
          </span>
          <h1 className="mt-3 text-4xl md:text-5xl font-bold text-text-primary">
            What I Can Do For You
          </h1>
          <p className="mt-4 text-text-tertiary leading-relaxed">
            From product strategy to pixel-perfect execution, I offer end-to-end design services powered by AI-enhanced workflows.
          </p>
        </div>

        {services.length === 0 ? (
          <div className="text-center py-[var(--spacing-11)] text-text-tertiary">
            <p>No services listed yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--spacing-8)]">
            {services.map((service) => (
              <div key={service.id} className="p-[var(--spacing-8)] rounded-2xl border border-border-subtle bg-surface-primary hover:shadow-lg hover:border-border-default transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary-subtle flex items-center justify-center mb-5 text-text-accent">
                  {iconMap[service.icon || ""] || <PenTool size={24} />}
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-3">{service.title}</h3>
                <p className="text-sm text-text-tertiary leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </FadeIn>
  );
}
