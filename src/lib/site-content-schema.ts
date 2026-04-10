import { z } from "zod";

const siteBrandSchema = z.object({
  name: z.string().min(1),
  footerTagline: z.string(),
});

const siteContactSchema = z.object({
  hotlineDigits: z.string().min(8).max(20),
  hotlineDisplay: z.string().min(1),
  email: z.string().email(),
  address: z.string().min(1),
  openingHours: z.string(),
});

const contactPageSchema = z.object({
  meta: z.object({
    title: z.string().min(1),
    description: z.string(),
    openGraphTitle: z.string().min(1),
  }),
  hero: z.object({
    title: z.string().min(1),
    lead: z.string(),
  }),
  bottomHint: z.object({
    prefix: z.string(),
    linkProductsLabel: z.string(),
    linkCartLabel: z.string(),
  }),
  cardLabels: z.object({
    address: z.string(),
    hotline: z.string(),
    email: z.string(),
    hours: z.string(),
    mapOpen: z.string(),
    call: z.string(),
    sendEmail: z.string(),
  }),
});

const pillarIconSchema = z.enum(["factory", "sparkles", "heartHandshake"]);

const aboutSectionSchema = z.object({
  eyebrow: z.string(),
  title: z.string(),
  paragraphs: z.array(z.string()),
  trailingImage: z.object({ alt: z.string() }).optional(),
});

const aboutPageSchema = z.object({
  meta: z.object({
    title: z.string().min(1),
    description: z.string(),
    openGraphTitle: z.string().min(1),
  }),
  organizationJsonLd: z.object({
    description: z.string(),
  }),
  hero: z.object({
    h1: z.string().min(1),
    lead: z.string(),
  }),
  stats: z.array(
    z.object({
      value: z.string(),
      label: z.string(),
    }),
  ),
  story: z.object({
    imageAlt: z.string(),
    eyebrow: z.string(),
    title: z.string(),
    body: z.string(),
    primaryCta: z.object({
      label: z.string(),
      href: z.string().min(1),
    }),
    secondaryCta: z.object({
      label: z.string(),
      href: z.string().min(1),
    }),
  }),
  pillars: z.array(
    z.object({
      icon: pillarIconSchema,
      title: z.string(),
      text: z.string(),
    }),
  ),
  sections: z.array(aboutSectionSchema),
  cta: z.object({
    title: z.string(),
    subtitle: z.string(),
    buttonLabel: z.string(),
    buttonHref: z.string().min(1),
  }),
});

export const siteContentSchema = z.object({
  siteBrand: siteBrandSchema,
  siteContact: siteContactSchema,
  contactPageContent: contactPageSchema,
  aboutPageContent: aboutPageSchema,
});

export type SiteContentData = z.infer<typeof siteContentSchema>;
export type AboutPillarIcon = z.infer<typeof pillarIconSchema>;
