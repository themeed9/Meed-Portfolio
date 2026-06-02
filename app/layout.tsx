import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import Footer from "@/components/layout/Footer";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Abdulhameed Abdulsalam | Product Designer",
  description: "Product Designer with an AI Edge. I design clear, usable, developer-friendly digital products using Figma, AI workflows, and design systems thinking.",
  openGraph: {
    title: "Abdulhameed Abdulsalam | Product Designer",
    description: "Product Designer with an AI Edge. I design clear, usable, developer-friendly digital products.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-on-background">
        <Providers>
          <AppShell footer={<Footer />}>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
