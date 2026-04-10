import "server-only";

import { cache } from "react";
import { db } from "@/server/db";

/** Danh sách hostname (và pattern `*.domain`) cho phép hiển thị ảnh ngoài. Rỗng = không chặn. */
export const getImageAllowlistHosts = cache(async (): Promise<string[]> => {
  const rows = await db.allowedImageHost.findMany({
    select: { hostname: true },
    orderBy: { hostname: "asc" },
  });
  return rows.map((r) => r.hostname);
});
