/** Production / preview base URL for canonical, OG, and JSON-LD (no trailing slash). */
export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "https://xdaily.vn";
  return raw.replace(/\/$/, "");
}

/** Absolute URL for a site path or already-absolute URL. */
export function absoluteUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = getSiteUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

/** Default OG / schema image when a page has no specific image. */
export const DEFAULT_OG_IMAGE_PATH = "/globe.svg";
