import { z } from "zod";

const siteBrandSchema = z.object({
  name: z.string().min(1),
  /** Logo header — URL tuyệt đối (CDN/Supabase) hoặc đường dẫn `/...` trong public */
  logoUrl: z.string().min(1),
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

/** URL tuyệt đối (https…) hoặc đường dẫn `/…` trong public; chuỗi rỗng = dùng ảnh mặc định trên trang. */
const aboutImageUrlField = z
  .union([z.string(), z.undefined()])
  .transform((s) => (typeof s === "string" ? s.trim() : ""));

const aboutTrailingImageSchema = z
  .object({
    alt: z.string(),
    url: z.union([z.string(), z.undefined()]).transform((s) => (typeof s === "string" ? s.trim() : "")),
  })
  .transform((o) => ({ alt: o.alt, url: o.url }));

const aboutSectionSchema = z.object({
  eyebrow: z.string(),
  title: z.string(),
  paragraphs: z.array(z.string()),
  trailingImage: aboutTrailingImageSchema.optional(),
});

export const aboutPageContentSchema = z.object({
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
    backgroundImageUrl: aboutImageUrlField,
  }),
  stats: z.array(
    z.object({
      value: z.string(),
      label: z.string(),
    }),
  ),
  story: z.object({
    imageAlt: z.string(),
    /** Ảnh khối câu chuyện — rỗng thì dùng ảnh mặc định */
    imageUrl: aboutImageUrlField,
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
  aboutPageContent: aboutPageContentSchema,
});

export type SiteContentData = z.infer<typeof siteContentSchema>;
export type AboutPageContentData = z.infer<typeof aboutPageContentSchema>;
export type AboutPillarIcon = z.infer<typeof pillarIconSchema>;
