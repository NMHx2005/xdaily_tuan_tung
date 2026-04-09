import type { Context } from '@/server/trpc/context';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { router, publicProcedure, adminProcedure } from '@/server/trpc/trpc';
import { paginationSchema, sortSchema } from '@/lib/validators';

type Db = Context['db'];
type PrismaTransactionClient = Omit<
  Db,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends' | '$use'
>;
type ProductUpdateData = NonNullable<NonNullable<Parameters<Db['product']['update']>[0]>['data']>;

const specificationsSchema = z.array(z.object({ key: z.string(), value: z.string() }));

function buildOrderBy(sort: z.infer<typeof sortSchema>) {
  switch (sort) {
    case 'price-asc':
      return { price: 'asc' as const };
    case 'price-desc':
      return { price: 'desc' as const };
    case 'name-asc':
      return { name: 'asc' as const };
    case 'name-desc':
      return { name: 'desc' as const };
    case 'newest':
      return { createdAt: 'desc' as const };
    case 'bestselling':
      return { position: 'asc' as const };
    case 'featured':
    default:
      return { position: 'asc' as const };
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
      paginationSchema
        .extend({ sort: sortSchema, q: z.string().optional() })
        .default({ page: 1, limit: 24, sort: 'featured' })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, sort, q } = input;
      const skip = (page - 1) * limit;
      const term = q?.trim();
      const where = term
        ? { name: { contains: term, mode: 'insensitive' as const } }
        : undefined;

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

  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.db.product.findUnique({
        where: { id: input.id },
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

      const where = {
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

      const collectionIds = productCollections.map((pc: { collectionId: string }) => pc.collectionId);

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
            url: z.string().min(1),
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

      try {
        return await ctx.db.$transaction(async (tx: PrismaTransactionClient) => {
          return tx.product.create({
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
        });
      } catch (e) {
        if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Slug hoặc SKU đã tồn tại',
          });
        }
        throw e;
      }
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        slug: z.string().min(1).optional(),
        name: z.string().min(1).optional(),
        shortDescription: z.string().max(200).optional(),
        description: z.string().optional(),
        price: z.number().int().positive().optional(),
        compareAtPrice: z.number().int().positive().nullable().optional(),
        sku: z.string().min(1).optional(),
        inStock: z.boolean().optional(),
        stockQuantity: z.number().int().min(0).optional(),
        isFeatured: z.boolean().optional(),
        badge: z.enum(['bestseller', 'new']).nullable().optional(),
        position: z.number().int().optional(),
        specifications: specificationsSchema.optional(),
        seoTitle: z.string().optional(),
        seoDescription: z.string().optional(),
        images: z
          .array(
            z.object({
              url: z.string().min(1),
              alt: z.string().default(''),
              position: z.number().int().default(0),
            })
          )
          .optional(),
        variants: z
          .array(
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
          )
          .optional(),
        collectionIds: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, images, variants, collectionIds, ...scalar } = input;

      const existing = await ctx.db.product.findUnique({ where: { id } });
      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Không tìm thấy sản phẩm' });
      }

      const data: ProductUpdateData = {
        ...(scalar.slug !== undefined && { slug: scalar.slug }),
        ...(scalar.name !== undefined && { name: scalar.name }),
        ...(scalar.shortDescription !== undefined && { shortDescription: scalar.shortDescription }),
        ...(scalar.description !== undefined && { description: scalar.description }),
        ...(scalar.price !== undefined && { price: scalar.price }),
        ...(scalar.compareAtPrice !== undefined && { compareAtPrice: scalar.compareAtPrice }),
        ...(scalar.sku !== undefined && { sku: scalar.sku }),
        ...(scalar.inStock !== undefined && { inStock: scalar.inStock }),
        ...(scalar.stockQuantity !== undefined && { stockQuantity: scalar.stockQuantity }),
        ...(scalar.isFeatured !== undefined && { isFeatured: scalar.isFeatured }),
        ...(scalar.badge !== undefined && { badge: scalar.badge }),
        ...(scalar.position !== undefined && { position: scalar.position }),
        ...(scalar.specifications !== undefined && { specifications: scalar.specifications }),
        ...(scalar.seoTitle !== undefined && { seoTitle: scalar.seoTitle }),
        ...(scalar.seoDescription !== undefined && { seoDescription: scalar.seoDescription }),
      };

      try {
        return await ctx.db.$transaction(async (tx: PrismaTransactionClient) => {
          if (Object.keys(data).length > 0) {
            await tx.product.update({ where: { id }, data });
          }

          if (images) {
            await tx.productImage.deleteMany({ where: { productId: id } });
            if (images.length > 0) {
              await tx.productImage.createMany({
                data: images.map((img, i) => ({
                  url: img.url,
                  alt: img.alt,
                  position: i,
                  productId: id,
                })),
              });
            }
          }

          if (variants) {
            await tx.productVariant.deleteMany({ where: { productId: id } });
            if (variants.length > 0) {
              await tx.productVariant.createMany({
                data: variants.map((v, i) => ({
                  name: v.name,
                  colorHex: v.colorHex,
                  price: v.price,
                  compareAtPrice: v.compareAtPrice,
                  sku: v.sku,
                  inStock: v.inStock,
                  image: v.image,
                  position: i,
                  productId: id,
                })),
              });
            }
          }

          if (collectionIds) {
            await tx.productCollection.deleteMany({ where: { productId: id } });
            if (collectionIds.length > 0) {
              await tx.productCollection.createMany({
                data: collectionIds.map((collectionId, index) => ({
                  productId: id,
                  collectionId,
                  position: index,
                })),
              });
            }
          }

          return tx.product.findUnique({
            where: { id },
            include: productInclude,
          });
        });
      } catch (e) {
        if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Slug hoặc SKU đã tồn tại',
          });
        }
        throw e;
      }
    }),

  getFlashSale: publicProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const flashSale = await ctx.db.flashSale.findFirst({
      where: {
        isActive: true,
        startsAt: { lte: now },
        endsAt: { gt: now },
      },
      include: {
        items: {
          orderBy: { position: 'asc' },
          include: {
            product: {
              include: listInclude,
            },
          },
        },
      },
    });

    return flashSale;
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
