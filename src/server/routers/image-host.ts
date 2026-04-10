import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { revalidatePath } from "next/cache";
import { router, publicProcedure, adminProcedure } from "@/server/trpc/trpc";
import { normalizeHostnameForStorage } from "@/lib/image-allowlist";

export const imageHostRouter = router({
  /** Storefront: danh sách hostname cho phép (ảnh). */
  listPublic: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.allowedImageHost.findMany({
      select: { hostname: true },
      orderBy: { hostname: "asc" },
    });
    return rows.map((r) => r.hostname);
  }),

  list: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.allowedImageHost.findMany({
      orderBy: { hostname: "asc" },
    });
  }),

  create: adminProcedure
    .input(
      z.object({
        hostname: z.string().min(1),
        note: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const hostname = normalizeHostnameForStorage(input.hostname);
      if (!hostname) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Hostname không hợp lệ",
        });
      }
      try {
        const row = await ctx.db.allowedImageHost.create({
          data: {
            hostname,
            note: input.note?.trim() ?? "",
          },
        });
        revalidatePath("/about");
        revalidatePath("/", "layout");
        return row;
      } catch {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Hostname đã tồn tại",
        });
      }
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        hostname: z.string().min(1),
        note: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const hostname = normalizeHostnameForStorage(input.hostname);
      if (!hostname) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Hostname không hợp lệ",
        });
      }
      try {
        const row = await ctx.db.allowedImageHost.update({
          where: { id: input.id },
          data: {
            hostname,
            note: input.note?.trim() ?? "",
          },
        });
        revalidatePath("/about");
        revalidatePath("/", "layout");
        return row;
      } catch {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Không cập nhật được (hostname trùng?)",
        });
      }
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.allowedImageHost.delete({
        where: { id: input.id },
      });
      revalidatePath("/about");
      revalidatePath("/", "layout");
      return { ok: true as const };
    }),
});
