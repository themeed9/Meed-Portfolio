import type { Metadata } from "next";

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  slug?: string;
  noIndex?: boolean;
}

const productionSiteUrl = "https://meed-portfolio.vercel.app";

function normalizeSiteUrl(value: string) {
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return withProtocol.replace(/\/$/, "");
}

type SiteEnvironment = {
  readonly NODE_ENV?: string;
  readonly NEXT_PUBLIC_SITE_URL?: string;
  readonly VERCEL_PROJECT_PRODUCTION_URL?: string;
};

export function getSiteUrl(environment: SiteEnvironment = process.env) {
  const vercelProductionUrl = environment.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (environment.NODE_ENV === "production" && vercelProductionUrl) {
    return normalizeSiteUrl(vercelProductionUrl);
  }
  const configured = environment.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configured) return productionSiteUrl;
  if (environment.NODE_ENV === "production" && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(configured)) {
    return productionSiteUrl;
  }
  return normalizeSiteUrl(configured);
}

export function generateMetadata({
  title,
  description,
  image,
  slug,
  noIndex,
}: SEOProps): Metadata {
  const baseUrl = getSiteUrl();
  const url = slug ? `${baseUrl}/${slug}` : baseUrl;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "Abdulhameed Abdulsalam",
      images: image ? [{ url: image, width: 1200, height: 630 }] : [],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
    robots: noIndex ? { index: false, follow: false } : undefined,
    alternates: { canonical: url },
  };
}
