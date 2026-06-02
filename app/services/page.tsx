import { prisma } from "@/lib/prisma";
import { fallbackServices } from "@/lib/defaults";
import { generateMetadata } from "@/lib/seo";
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
    <div className="pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mb-16">
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
            Services
          </span>
          <h1 className="mt-3 text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            What I Can Do For You
          </h1>
          <p className="mt-4 text-gray-500 dark:text-gray-400 leading-relaxed">
            From product strategy to pixel-perfect execution, I offer end-to-end design services powered by AI-enhanced workflows.
          </p>
        </div>

        {services.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p>No services listed yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div key={service.id} className="p-8 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-lg hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-5 text-blue-600 dark:text-blue-400">
                  {iconMap[service.icon || ""] || <PenTool size={24} />}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{service.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
