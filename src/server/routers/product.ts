import { z } from 'zod';
import { router, publicProcedure, adminProcedure } from '@/server/trpc/trpc';
import type { Prisma } from '@prisma/client';

const sortOptions = z.enum([
  'featured',
  'price-asc',
  'price-desc',
  'name-asc',
  'name-desc',
  'newest',
  'bestselling',
]);

function buildOrderBy(sort: z.infer<typeof sortOptions>): Prisma.ProductOrderByWithRelationInput {
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

export const productRouter = router({
  getAll: publicProcedure
    .input(
      z.object({
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(100).default(24),
        sort: sortOptions.default('featured'),
      }).default({ page: 1, limit: 24, sort: 'featured' })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, sort } = input;
      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        ctx.db.product.findMany({
          skip,
          take: limit,
          orderBy: buildOrderBy(sort),
          include: {
            images: { orderBy: { position: 'asc' }, take: 1 },
            variants: { orderBy: { position: 'asc' } },
          },
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
        throw new Error('Product not found');
      }

      return product;
    }),

  getByCollection: publicProcedure
    .input(
      z.object({
        collectionSlug: z.string(),
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(100).default(24),
        sort: sortOptions.default('featured'),
      })
    )
    .query(async ({ ctx, input }) => {
      const { collectionSlug, page, limit, sort } = input;
      const skip = (page - 1) * limit;

      const collection = await ctx.db.collection.findUnique({
        where: { slug: collectionSlug },
      });

      if (!collection) {
        throw new Error('Collection not found');
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
          include: {
            images: { orderBy: { position: 'asc' }, take: 1 },
            variants: { orderBy: { position: 'asc' } },
          },
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
      include: {
        images: { orderBy: { position: 'asc' }, take: 1 },
        variants: { orderBy: { position: 'asc' } },
      },
    });
  }),

  getBestsellers: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.product.findMany({
      where: { badge: 'bestseller' },
      take: 8,
      orderBy: { position: 'asc' },
      include: {
        images: { orderBy: { position: 'asc' }, take: 1 },
        variants: { orderBy: { position: 'asc' } },
      },
    });
  }),

  getNewArrivals: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.product.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        images: { orderBy: { position: 'asc' }, take: 1 },
        variants: { orderBy: { position: 'asc' } },
      },
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
        include: {
          images: { orderBy: { position: 'asc' }, take: 1 },
          variants: { orderBy: { position: 'asc' } },
        },
      });
    }),

  create: adminProcedure
    .input(
      z.object({
        slug: z.string(),
        name: z.string(),
        shortDescription: z.string().default(''),
        description: z.string().default(''),
        price: z.number().int(),
        compareAtPrice: z.number().int().optional(),
        sku: z.string(),
        inStock: z.boolean().default(true),
        stockQuantity: z.number().int().default(0),
        isFeatured: z.boolean().default(false),
        badge: z.string().optional(),
        position: z.number().int().default(0),
        specifications: z.any().default([]),
        seoTitle: z.string().default(''),
        seoDescription: z.string().default(''),
        images: z.array(
          z.object({
            url: z.string(),
            alt: z.string().default(''),
            position: z.number().int().default(0),
          })
        ).default([]),
        variants: z.array(
          z.object({
            name: z.string(),
            colorHex: z.string().default(''),
            price: z.number().int(),
            compareAtPrice: z.number().int().optional(),
            sku: z.string(),
            inStock: z.boolean().default(true),
            image: z.string().optional(),
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
        badge: z.string().nullable().optional(),
        position: z.number().int().optional(),
        specifications: z.any().optional(),
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
      return ctx.db.product.delete({ where: { id: input.id } });
    }),
});
