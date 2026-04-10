/** Gộp dữ liệu từ DB lên bản mặc định trong code (bổ sung field mới khi deploy). */
export function mergeSiteContentFromDb<T extends Record<string, unknown>>(
  codeDefaults: T,
  fromDb: unknown,
): T {
  if (fromDb === null || fromDb === undefined) return codeDefaults;
  if (typeof fromDb !== "object" || Array.isArray(fromDb)) return codeDefaults;
  const db = fromDb as Record<string, unknown>;
  const base = codeDefaults as Record<string, unknown>;
  const out: Record<string, unknown> = { ...base };
  for (const key of Object.keys(base)) {
    if (!(key in db) || db[key] === undefined) continue;
    const d = base[key];
    const v = db[key];
    if (Array.isArray(d)) {
      out[key] = Array.isArray(v) ? v : d;
    } else if (d !== null && typeof d === "object" && !Array.isArray(d)) {
      out[key] =
        v !== null && typeof v === "object" && !Array.isArray(v)
          ? mergeSiteContentFromDb(d as Record<string, unknown>, v)
          : v;
    } else {
      out[key] = v;
    }
  }
  return out as T;
}
