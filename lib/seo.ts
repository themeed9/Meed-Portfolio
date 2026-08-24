import { Metadata } from "next";

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  slug?: string;
  noIndex?: boolean;
}

const productionSiteUrl = "https://meedport.com";

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configured) return productionSiteUrl;
  if (process.env.NODE_ENV === "production" && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(configured)) {
    return productionSiteUrl;
  }
  return configured.replace(/\/$/, "");
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
