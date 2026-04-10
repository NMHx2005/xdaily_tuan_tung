/**
 * Re-export mặc định trong code (khi không đọc DB).
 * Trên storefront, ưu tiên `getMergedSiteContent()` từ `@/lib/get-site-content`.
 */
export { defaultSiteContent } from "./site-defaults";
export type { DefaultSiteContent } from "./site-defaults";
export type { AboutPillarIcon } from "@/lib/site-content-schema";

import { defaultSiteContent } from "./site-defaults";

const c = defaultSiteContent.siteContact;
const b = defaultSiteContent.siteBrand;

/** @deprecated Dùng `getMergedSiteContent()` — giữ cho import cũ / test */
export const siteBrand = b;
export const siteContact = c;
export const SITE_HOTLINE = c.hotlineDigits;
export const SITE_HOTLINE_TEL = `tel:${c.hotlineDigits}` as const;
export const SITE_HOTLINE_DISPLAY = c.hotlineDisplay;
export const SITE_CONTACT_EMAIL = c.email;
export const SITE_ADDRESS = c.address;
export const SITE_OPENING_HOURS = c.openingHours;
export const contactPageContent = defaultSiteContent.contactPageContent;
export const aboutPageContent = defaultSiteContent.aboutPageContent;

export function getGoogleMapsSearchUrl(): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE_ADDRESS)}`;
}
