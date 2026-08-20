import type { Metadata } from "next";
import Script from "next/script";

import localFont from "next/font/local";
import "./globals.css";
import "./hero-a.css";
import AppShell from "@/components/layout/AppShell";
import Footer from "@/components/layout/Footer";
import Providers from "@/components/Providers";

const geistSans = localFont({
  src: "../node_modules/next/dist/next-devtools/server/font/geist-latin.woff2",
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = localFont({
  src: "../node_modules/next/dist/next-devtools/server/font/geist-mono-latin.woff2",
  variable: "--font-geist-mono",
  display: "swap",
});

const inter = localFont({
  src: "./fonts/inter-latin-400.woff2",
  weight: "400",
  variable: "--font-inter",
  display: "swap",
});

const siteTitle = "Abdulhameed Abdulsalam — Product Designer";
const siteDescription =
  "Product Designer focused on fintech, SaaS, UX research, design systems, and technically feasible digital experiences across mobile and web.";

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
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased bg-background text-on-background`}
      >
        <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem("theme")||"system";if(t==="system"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.classList.remove("light","dark");document.documentElement.classList.add(t)}catch(e){}})()`
        }} />
        <a href="#main-content" className="skip-to-content">
          Skip to content
        </a>
        <Providers>
          <AppShell footer={<Footer />}>{children}</AppShell>
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
