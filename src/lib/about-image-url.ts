import { DEFAULT_OG_IMAGE_PATH } from "@/lib/seo";

/** Chuẩn hoá link dán từ admin (khoảng trắng, dấu ngoặc, URL protocol-relative). */
export function normalizeAboutImageUrl(raw: string): string {
  let t = raw.trim().replace(/\u200b/g, "");
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  ) {
    t = t.slice(1, -1).trim();
  }
  return t;
}

export function resolveAboutDisplaySrc(
  url: string,
  fallback: string = DEFAULT_OG_IMAGE_PATH,
): string {
  const n = normalizeAboutImageUrl(url);
  if (!n) return fallback;
  if (n.startsWith("//")) return `https:${n}`;
  return n;
}
