import { generateMetadata } from "@/lib/seo";

export const metadata = generateMetadata({
  title: "Contact",
  description: "Get in touch with Abdulhameed Abdulsalam for product design, UI/UX, and AI-enhanced design projects.",
  slug: "contact",
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
