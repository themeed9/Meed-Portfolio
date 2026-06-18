import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Abdulhameed Abdulsalam for product design, UI/UX, and AI-enhanced design projects.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
