import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { revalidatePath } from "next/cache";
import { router, publicProcedure, adminProcedure } from "@/server/trpc/trpc";
import { siteContentSchema } from "@/lib/site-content-schema";
import { loadMergedSiteContent } from "@/lib/get-site-content";

const SITE_CONTENT_ID = "default";

type SiteContentDelegate = {
  findUnique: (args: {
    where: { id: string };
  }) => Promise<{ updatedAt: Date; payload: unknown } | null>;
  upsert: (args: unknown) => Promise<unknown>;
};

/** Delegate có thể undefined nếu Prisma client chưa regenerate. */
function siteContentDelegate(db: unknown): SiteContentDelegate | undefined {
  return (db as { siteContent?: SiteContentDelegate }).siteContent;
}

export const siteRouter = router({
  /** Nội dung hiển thị (đã gộp DB + mặc định). */
  getPublic: publicProcedure.query(async ({ ctx }) => {
    return loadMergedSiteContent(ctx.db);
  }),

  getAdmin: adminProcedure.query(async ({ ctx }) => {
    const sc = siteContentDelegate(ctx.db);
    const row = sc
      ? await sc.findUnique({
          where: { id: SITE_CONTENT_ID },
        })
      : null;
    const content = await loadMergedSiteContent(ctx.db);
    return {
      content,
      updatedAt: row?.updatedAt ?? null,
    };
  }),

  update: adminProcedure
    .input(z.object({ content: siteContentSchema }))
    .mutation(async ({ ctx, input }) => {
      const parsed = siteContentSchema.parse(input.content);
      const sc = siteContentDelegate(ctx.db);
      if (!sc?.upsert) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message:
            "Prisma client chưa có model SiteContent. Chạy `npx prisma generate` rồi khởi động lại `npm run dev`.",
        });
      }
      await sc.upsert({
        where: { id: SITE_CONTENT_ID },
        create: {
          id: SITE_CONTENT_ID,
          payload: parsed as object,
        },
        update: {
          payload: parsed as object,
        },
      });
      revalidatePath("/", "layout");
      revalidatePath("/about");
      revalidatePath("/contact");
      return { ok: true as const };
    }),
});
