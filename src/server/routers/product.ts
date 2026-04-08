import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, adminProcedure } from '@/server/trpc/trpc';
import { paginationSchema, sortSchema } from '@/lib/validators';
import type { Prisma } from '@prisma/client';

const specificationsSchema = z.array(z.object({ key: z.string(), value: z.string() }));

function buildOrderBy(sort: z.infer<typeof sortSchema>): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case 'price-asc':
      return { price: 'asc' };
    case 'price-desc':
      return { price: 'desc' };
    case 'name-asc':
      return { name: 'asc' };
    case 'name-desc':
      return { name: 'desc' };
    case 'newest':
      return { createdAt: 'desc' };
    case 'bestselling':
      return { position: 'asc' };
    case 'featured':
    default:
      return { position: 'asc' };
  }
}

const productInclude = {
  images: { orderBy: { position: 'asc' as const } },
  variants: { orderBy: { position: 'asc' as const } },
  collections: {
    include: { collection: true },
  },
};

const listInclude = {
  images: { orderBy: { position: 'asc' as const }, take: 1 },
  variants: { orderBy: { position: 'asc' as const } },
};

export const productRouter = router({
  getAll: publicProcedure
    .input(
      paginationSchema.extend({ sort: sortSchema }).default({ page: 1, limit: 24, sort: 'featured' })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, sort } = input;
      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        ctx.db.product.findMany({
          skip,
          take: limit,
          orderBy: buildOrderBy(sort),
          include: listInclude,
        }),
        ctx.db.product.count(),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        items,
        total,
        page,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.db.product.findUnique({
        where: { slug: input.slug },
        include: productInclude,
      });

      if (!product) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Không tìm thấy sản phẩm' });
      }

      return product;
    }),

  getByCollection: publicProcedure
    .input(
      z.object({ collectionSlug: z.string() })
        .merge(paginationSchema)
        .extend({ sort: sortSchema })
    )
    .query(async ({ ctx, input }) => {
      const { collectionSlug, page, limit, sort } = input;
      const skip = (page - 1) * limit;

      const collection = await ctx.db.collection.findUnique({
        where: { slug: collectionSlug },
      });

      if (!collection) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Không tìm thấy danh mục' });
      }

      const where: Prisma.ProductWhereInput = {
        collections: { some: { collectionId: collection.id } },
      };

      const [items, total] = await Promise.all([
        ctx.db.product.findMany({
          where,
          skip,
          take: limit,
          orderBy: buildOrderBy(sort),
          include: listInclude,
        }),
        ctx.db.product.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        collection,
        items,
        total,
        page,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };
    }),

  getFeatured: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.product.findMany({
      where: { isFeatured: true },
      take: 8,
      orderBy: { position: 'asc' },
      include: listInclude,
    });
  }),

  getBestsellers: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.product.findMany({
      where: { badge: 'bestseller' },
      take: 8,
      orderBy: { position: 'asc' },
      include: listInclude,
    });
  }),

  getNewArrivals: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.product.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: listInclude,
    });
  }),

  getRelated: publicProcedure
    .input(
      z.object({
        productId: z.string(),
        limit: z.number().int().positive().default(8),
      })
    )
    .query(async ({ ctx, input }) => {
      const productCollections = await ctx.db.productCollection.findMany({
        where: { productId: input.productId },
        select: { collectionId: true },
      });

      const collectionIds = productCollections.map((pc) => pc.collectionId);

      return ctx.db.product.findMany({
        where: {
          id: { not: input.productId },
          collections: collectionIds.length > 0
            ? { some: { collectionId: { in: collectionIds } } }
            : undefined,
        },
        take: input.limit,
        orderBy: { createdAt: 'desc' },
        include: listInclude,
      });
    }),

  create: adminProcedure
    .input(
      z.object({
        slug: z.string().min(1),
        name: z.string().min(1, 'Tên sản phẩm không được trống'),
        shortDescription: z.string().default(''),
        description: z.string().default(''),
        price: z.number().int().positive('Giá phải lớn hơn 0'),
        compareAtPrice: z.number().int().positive().nullable().default(null),
        sku: z.string().min(1, 'SKU không được trống'),
        inStock: z.boolean().default(true),
        stockQuantity: z.number().int().min(0).default(0),
        isFeatured: z.boolean().default(false),
        badge: z.enum(['bestseller', 'new']).nullable().default(null),
        position: z.number().int().default(0),
        specifications: specificationsSchema.default([]),
        seoTitle: z.string().default(''),
        seoDescription: z.string().default(''),
        images: z.array(
          z.object({
            url: z.string().url(),
            alt: z.string().default(''),
            position: z.number().int().default(0),
          })
        ).default([]),
        variants: z.array(
          z.object({
            name: z.string().min(1),
            colorHex: z.string().default(''),
            price: z.number().int().positive(),
            compareAtPrice: z.number().int().positive().nullable().default(null),
            sku: z.string().min(1),
            inStock: z.boolean().default(true),
            image: z.string().nullable().default(null),
            position: z.number().int().default(0),
          })
        ).default([]),
        collectionIds: z.array(z.string()).default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { images, variants, collectionIds, ...productData } = input;

      return ctx.db.product.create({
        data: {
          ...productData,
          images: { create: images },
          variants: { create: variants },
          collections: {
            create: collectionIds.map((collectionId, index) => ({
              collectionId,
              position: index,
            })),
          },
        },
        include: productInclude,
      });
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        slug: z.string().optional(),
        name: z.string().optional(),
        shortDescription: z.string().optional(),
        description: z.string().optional(),
        price: z.number().int().optional(),
        compareAtPrice: z.number().int().nullable().optional(),
        sku: z.string().optional(),
        inStock: z.boolean().optional(),
        stockQuantity: z.number().int().optional(),
        isFeatured: z.boolean().optional(),
        badge: z.enum(['bestseller', 'new']).nullable().optional(),
        position: z.number().int().optional(),
        specifications: specificationsSchema.optional(),
        seoTitle: z.string().optional(),
        seoDescription: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.product.update({
        where: { id },
        data,
        include: productInclude,
      });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.product.delete({ where: { id: input.id } });
      } catch {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Sản phẩm không tồn tại' });
      }
    }),
});
