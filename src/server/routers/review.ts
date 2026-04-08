import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, adminProcedure } from '@/server/trpc/trpc';

export const reviewRouter = router({
  getByProduct: publicProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.review.findMany({
        where: { productId: input.productId },
        orderBy: { createdAt: 'desc' },
      });
    }),

  create: publicProcedure
    .input(
      z.object({
        productId: z.string(),
        author: z.string().min(2, 'Tên tối thiểu 2 ký tự'),
        rating: z.number().int().min(1).max(5),
        content: z.string().min(3, 'Nội dung tối thiểu 3 ký tự').max(1000),
        purchaseStatus: z.enum(['purchased', 'using', 'interested']).default('interested'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.review.create({ data: input });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.review.delete({ where: { id: input.id } });
      } catch {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Đánh giá không tồn tại' });
      }
    }),
});
