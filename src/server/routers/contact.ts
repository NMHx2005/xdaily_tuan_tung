import { z } from "zod";
import { TRPCError } from "@trpc/server";
import type { PrismaClient } from "@prisma/client";
import { router, publicProcedure, adminProcedure } from "@/server/trpc/trpc";
import { sendContactNotificationEmail } from "@/lib/emails/send-contact-notification";

/** Delegate có thể thiếu nếu Prisma Client chưa regenerate / server chưa restart sau migrate. */
function contactMessageDelegate(
  db: unknown,
): PrismaClient["contactMessage"] | undefined {
  return (db as PrismaClient).contactMessage;
}

function requireContactDelegate(db: unknown): PrismaClient["contactMessage"] {
  const cm = contactMessageDelegate(db);
  if (!cm?.count) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message:
        "Prisma client chưa có model ContactMessage. Chạy `npx prisma generate` và khởi động lại `npm run dev` (hoặc restart process production).",
    });
  }
  return cm;
}

const submitInput = z.object({
  name: z.string().min(2, "Vui lòng nhập họ tên"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().optional(),
  message: z
    .string()
    .min(10, "Nội dung tối thiểu 10 ký tự")
    .max(2000),
});

export const contactRouter = router({
  submit: publicProcedure.input(submitInput).mutation(async ({ ctx, input }) => {
    const phone =
      input.phone?.trim() === "" ? undefined : input.phone?.trim();
    if (phone !== undefined && !/^(0[35789])\d{8}$/.test(phone)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Số điện thoại không hợp lệ",
      });
    }

    const cm = requireContactDelegate(ctx.db);

    const emailNorm = input.email.trim().toLowerCase();
    const twoMinAgo = new Date(Date.now() - 2 * 60 * 1000);
    const recent = await cm.count({
      where: {
        email: emailNorm,
        createdAt: { gte: twoMinAgo },
      },
    });
    if (recent >= 5) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Bạn đã gửi quá nhiều tin nhắn. Vui lòng thử lại sau vài phút.",
      });
    }

    const row = await cm.create({
      data: {
        name: input.name.trim(),
        email: emailNorm,
        phone: phone ?? null,
        message: input.message.trim(),
      },
    });

    await sendContactNotificationEmail({
      name: row.name,
      email: row.email,
      phone: row.phone,
      message: row.message,
    });

    return { id: row.id };
  }),

  list: adminProcedure
    .input(
      z.object({
        take: z.number().min(1).max(200).default(100),
      }),
    )
    .query(async ({ ctx, input }) => {
      const take = input.take;
      const cm = requireContactDelegate(ctx.db);
      return cm.findMany({
        take,
        orderBy: { createdAt: "desc" },
      });
    }),

  markRead: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const cm = requireContactDelegate(ctx.db);
      return cm.update({
        where: { id: input.id },
        data: { readAt: new Date() },
      });
    }),
});
