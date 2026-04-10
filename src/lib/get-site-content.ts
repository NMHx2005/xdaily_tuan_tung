import "server-only";

import { cache } from "react";
import { db } from "@/server/db";
import { defaultSiteContent } from "@/content/site-defaults";
import { mergeSiteContentFromDb } from "@/lib/site-content-merge";
import { siteContentSchema, type SiteContentData } from "@/lib/site-content-schema";

const SITE_CONTENT_ID = "default";

function cloneDefaults(): SiteContentData {
  return JSON.parse(JSON.stringify(defaultSiteContent)) as SiteContentData;
}

export async function loadMergedSiteContent(
  database: typeof db,
): Promise<SiteContentData> {
  /** `siteContent` thiếu khi Prisma client cũ (chưa generate / chưa restart dev) — chỉ dùng mặc định code. */
  const row = await (
    database as unknown as {
      siteContent?: {
        findUnique: (args: {
          where: { id: string };
        }) => Promise<{ payload: unknown } | null>;
      };
    }
  ).siteContent?.findUnique({
    where: { id: SITE_CONTENT_ID },
  });

  const merged = mergeSiteContentFromDb(
    cloneDefaults() as unknown as Record<string, unknown>,
    row?.payload ?? {},
  );
  const parsed = siteContentSchema.safeParse(merged);
  if (parsed.success) return parsed.data;
  return siteContentSchema.parse(cloneDefaults());
}

/** Nội dung website đã gộp (DB + mặc định code). Dùng trong Server Components. */
export const getMergedSiteContent = cache(async (): Promise<SiteContentData> => {
  return loadMergedSiteContent(db);
});
