import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, adminProcedure } from '@/server/trpc/trpc';

export const collectionRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.collection.findMany({
      where: { isVisible: true },
      orderBy: { position: 'asc' },
      include: {
        _count: { select: { products: true } },
      },
    });
  }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const collection = await ctx.db.collection.findUnique({
        where: { slug: input.slug },
        include: {
          _count: { select: { products: true } },
        },
      });

      if (!collection) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Không tìm thấy danh mục' });
      }

      return collection;
    }),

  create: adminProcedure
    .input(
      z.object({
        slug: z.string().min(1),
        name: z.string().min(1),
        description: z.string().optional(),
        image: z.string().optional(),
        position: z.number().int().default(0),
        isVisible: z.boolean().default(true),
        seoTitle: z.string().default(''),
        seoDescription: z.string().default(''),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.collection.create({ data: input });
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        slug: z.string().optional(),
        name: z.string().optional(),
        description: z.string().nullable().optional(),
        image: z.string().nullable().optional(),
        position: z.number().int().optional(),
        isVisible: z.boolean().optional(),
        seoTitle: z.string().optional(),
        seoDescription: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.collection.update({ where: { id }, data });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.collection.delete({ where: { id: input.id } });
      } catch {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Danh mục không tồn tại' });
      }
    }),
});
