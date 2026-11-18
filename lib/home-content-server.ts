import { cache } from "react";
import { getSiteContent } from "@/lib/portfolio-content";
import {
  beyondSchema, brandPageSchema, homeAboutSchema, homeContactSchema, homeContentKeys, homeDefaults,
  homeHeroSchema, moreWorkSchema, resolveContent, siteFooterSchema,
} from "@/lib/home-content";

type Settings = { contactEmail?: string };

/** All homepage sections, each validated against its schema with the Figma copy as fallback. */
export const getHomeContent = cache(async () => {
  const [hero, moreWork, about, beyond, contact, settings] = await Promise.all([
    getSiteContent<unknown>(homeContentKeys.hero),
    getSiteContent<unknown>(homeContentKeys.moreWork),
    getSiteContent<unknown>(homeContentKeys.about),
    getSiteContent<unknown>(homeContentKeys.beyond),
    getSiteContent<unknown>(homeContentKeys.contact),
    getSiteContent<Settings>("site-settings"),
  ]);
  const resolvedContact = resolveContent(homeContactSchema, contact, homeDefaults.contact);
  return {
    hero: resolveContent(homeHeroSchema, hero, homeDefaults.hero),
    moreWork: resolveContent(moreWorkSchema, moreWork, homeDefaults.moreWork),
    about: resolveContent(homeAboutSchema, about, homeDefaults.about),
    beyond: resolveContent(beyondSchema, beyond, homeDefaults.beyond),
    // The contact email set in Admin → Settings wins over the section default.
    contact: { ...resolvedContact, email: settings?.contactEmail || resolvedContact.email || homeDefaults.contact.email },
  };
});

export const getContactContent = cache(async () => (await getHomeContent()).contact);

export const getFooterContent = cache(async () =>
  resolveContent(siteFooterSchema, await getSiteContent<unknown>(homeContentKeys.footer), homeDefaults.footer));

export const getBrandPageContent = cache(async () =>
  resolveContent(brandPageSchema, await getSiteContent<unknown>(homeContentKeys.brandPage), homeDefaults.brandPage));
