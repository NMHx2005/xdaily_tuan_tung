import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure } from '@/server/trpc/trpc';

export const newsletterRouter = router({
  subscribe: publicProcedure
    .input(z.object({ email: z.string().email('Email không hợp lệ') }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.newsletter.findUnique({
        where: { email: input.email },
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Email đã được đăng ký nhận tin',
        });
      }

      await ctx.db.newsletter.create({ data: { email: input.email } });
      return { success: true };
    }),
});
