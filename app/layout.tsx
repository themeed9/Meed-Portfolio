import type { Metadata } from "next";
import Script from "next/script";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import Footer from "@/components/layout/Footer";
import Providers from "@/components/Providers";
import PageTransition from "@/components/layout/PageTransition";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const siteTitle = "Abdulhameed Abdulsalam | Product Designer";
const siteDescription =
  "Product Designer with an AI Edge. I design clear, usable, developer-friendly digital products using Figma, AI workflows, and design systems thinking.";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://meedport.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: siteTitle,
    template: "%s | Abdulhameed Abdulsalam",
  },
  description: siteDescription,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    type: "website",
    siteName: "Meed Portfolio",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Abdulhameed Abdulsalam",
  jobTitle: "Product Designer",
  description: siteDescription,
  url: "https://meedport.com",
  sameAs: [
    "https://linkedin.com/in/meedport",
    "https://twitter.com/meedport",
    "https://dribbble.com/meedport",
    "https://github.com/meedport",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background text-on-background`}
      >
        <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem("theme")||"system";if(t==="system"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.classList.remove("light","dark");document.documentElement.classList.add(t)}catch(e){}})()`
        }} />
        <a href="#main-content" className="skip-to-content">
          Skip to content
        </a>
        <Providers>
          <AppShell footer={<Footer />}>
            <PageTransition>{children}</PageTransition>
          </AppShell>
        </Providers>
        <script
          id="schema-person"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
