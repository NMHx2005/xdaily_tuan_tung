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

  /** Admin: tất cả danh mục (kể cả ẩn) — có đếm SP */
  getAllForAdmin: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.collection.findMany({
      orderBy: { position: 'asc' },
      include: {
        _count: { select: { products: true } },
      },
    });
  }),

  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const collection = await ctx.db.collection.findUnique({
        where: { id: input.id },
        include: {
          products: {
            orderBy: { position: 'asc' },
            include: {
              product: {
                include: {
                  images: { take: 1, orderBy: { position: 'asc' } },
                },
              },
            },
          },
        },
      });

      if (!collection) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Không tìm thấy bộ sưu tập' });
      }

      return collection;
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
        /** Thay toàn bộ sản phẩm trong collection (theo thứ tự) */
        productIds: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, productIds, ...data } = input;

      return ctx.db.$transaction(async (tx) => {
        await tx.collection.update({
          where: { id },
          data,
        });

        if (productIds !== undefined) {
          await tx.productCollection.deleteMany({ where: { collectionId: id } });
          if (productIds.length > 0) {
            await tx.productCollection.createMany({
              data: productIds.map((productId, index) => ({
                collectionId: id,
                productId,
                position: index,
              })),
            });
          }
        }

        const full = await tx.collection.findUnique({
          where: { id },
          include: {
            products: {
              orderBy: { position: 'asc' },
              include: {
                product: {
                  include: {
                    images: { take: 1, orderBy: { position: 'asc' } },
                  },
                },
              },
            },
          },
        });
        if (!full) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Danh mục không tồn tại' });
        }
        return full;
      });
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
