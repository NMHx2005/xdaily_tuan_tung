import { normalizeAboutImageUrl } from "@/lib/about-image-url";

/**
 * Khớp hostname với một dòng trong allowlist.
 * - `file.hstatic.net` — khớp đúng host đó
 * - `*.hstatic.net` — khớp mọi subdomain của hstatic.net (kể cả `hstatic.net` nếu cần: chỉ subdomain)
 */
export function hostnameMatchesRule(host: string, rule: string): boolean {
  const h = host.toLowerCase().trim();
  const r = rule.trim().toLowerCase();
  if (!h || !r) return false;
  if (r.startsWith("*.")) {
    const base = r.slice(2);
    if (!base) return false;
    return h === base || h.endsWith(`.${base}`);
  }
  return h === r;
}

/** Trích hostname từ URL / chuỗi user nhập (có thể là full URL). */
export function parseHostnameFromImageUrl(raw: string): string | null {
  const n = normalizeAboutImageUrl(raw);
  if (!n) return null;
  if (n.startsWith("/") && !n.startsWith("//")) return null;
  if (n.startsWith("data:")) return null;
  try {
    const url = n.startsWith("//") ? new URL(`https:${n}`) : new URL(n);
    return url.hostname.toLowerCase() || null;
  } catch {
    return null;
  }
}

/**
 * Danh sách hostname cho phép (từ DB). Rỗng = không hạn chế (cho phép mọi domain).
 */
export function isImageUrlAllowedByRules(
  src: string,
  allowedHostnames: string[],
): boolean {
  if (allowedHostnames.length === 0) return true;
  const n = normalizeAboutImageUrl(src);
  if (!n) return true;
  if (n.startsWith("/") && !n.startsWith("//")) return true;
  if (n.startsWith("data:")) return true;
  const host = parseHostnameFromImageUrl(n);
  if (!host) return false;
  return allowedHostnames.some((rule) => hostnameMatchesRule(host, rule));
}

/** Chuẩn hoá input admin (URL hoặc hostname) thành hostname lưu DB. Hỗ trợ `*.example.com`. */
export function normalizeHostnameForStorage(input: string): string {
  let t = input.trim().toLowerCase();
  if (!t) return "";
  const wildcard = t.startsWith("*.");
  if (wildcard) t = t.slice(2);
  if (t.includes("://") || t.startsWith("//")) {
    try {
      const u = new URL(t.startsWith("//") ? `https:${t}` : t);
      t = u.hostname;
    } catch {
      return "";
    }
  } else {
    t = t.split("/")[0] ?? t;
  }
  if (!t) return "";
  return wildcard ? `*.${t}` : t;
}
