import type { Context } from '@/server/trpc/context';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, adminProcedure } from '@/server/trpc/trpc';

type Db = Context['db'];

/** Interactive `$transaction` client — same as `Omit<PrismaClient, ITXClientDenyList>`. */
type PrismaTransactionClient = Omit<
  Db,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends' | '$use'
>;

/** Shape of `orderItem.groupBy` rows for top-products (by productId + sums). */
type AdminTopProductGroupRow = {
  productId: string;
  _sum: { quantity: number | null; price: number | null };
};

type ProductWithThumb = Awaited<ReturnType<Db['product']['findMany']>>[number];

export const adminRouter = router({
  getBanners: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.banner.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' },
    });
  }),

  /** Admin settings: mọi banner (kể cả tắt) */
  getBannersAll: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.banner.findMany({
      orderBy: { position: 'asc' },
    });
  }),

  createBanner: adminProcedure
    .input(
      z.object({
        image: z.string().min(1),
        mobileImage: z.string().min(1).nullable().default(null),
        title: z.string().default(''),
        subtitle: z.string().default(''),
        link: z.string().default(''),
        position: z.number().int().default(0),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.banner.create({ data: input });
    }),

  updateBanner: adminProcedure
    .input(
      z.object({
        id: z.string(),
        image: z.string().min(1).optional(),
        mobileImage: z.string().min(1).nullable().optional(),
        title: z.string().optional(),
        subtitle: z.string().optional(),
        link: z.string().optional(),
        position: z.number().int().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.banner.update({ where: { id }, data });
    }),

  deleteBanner: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.banner.delete({ where: { id: input.id } });
      } catch {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Banner không tồn tại' });
      }
    }),

  getDashboardStats: adminProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [productCount, monthlyOrders, customerCount, monthlyRevenue] = await Promise.all([
      ctx.db.product.count(),
      ctx.db.order.count({ where: { createdAt: { gte: startOfMonth } } }),
      ctx.db.user.count({ where: { role: 'CUSTOMER' } }),
      ctx.db.order.aggregate({
        _sum: { total: true },
        where: { status: 'DELIVERED', createdAt: { gte: startOfMonth } },
      }),
    ]);

    return {
      revenue: monthlyRevenue._sum.total ?? 0,
      orderCount: monthlyOrders,
      customerCount,
      productCount,
    };
  }),

  getRecentOrders: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }),

  getFlashSale: adminProcedure.query(async ({ ctx }) => {
    const fs = await ctx.db.flashSale.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
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
    return fs;
  }),

  updateFlashSale: adminProcedure
    .input(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1),
        startsAt: z.coerce.date(),
        endsAt: z.coerce.date(),
        isActive: z.boolean(),
        items: z.array(
          z.object({
            productId: z.string(),
            salePrice: z.number().int().positive(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, items, ...data } = input;

      return ctx.db.$transaction(async (tx: PrismaTransactionClient) => {
        let flashId = id;
        if (flashId) {
          await tx.flashSale.update({
            where: { id: flashId },
            data: {
              name: data.name,
              startsAt: data.startsAt,
              endsAt: data.endsAt,
              isActive: data.isActive,
            },
          });
        } else {
          const created = await tx.flashSale.create({
            data: {
              name: data.name,
              startsAt: data.startsAt,
              endsAt: data.endsAt,
              isActive: data.isActive,
            },
          });
          flashId = created.id;
        }

        await tx.flashSaleItem.deleteMany({ where: { flashSaleId: flashId } });
        if (items.length > 0) {
          await tx.flashSaleItem.createMany({
            data: items.map((it, index) => ({
              flashSaleId: flashId!,
              productId: it.productId,
              salePrice: it.salePrice,
              position: index,
            })),
          });
        }

        return tx.flashSale.findUnique({
          where: { id: flashId },
          include: {
            items: {
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
      });
    }),

  reorderBanners: adminProcedure
    .input(z.object({ orderedIds: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.$transaction(
        input.orderedIds.map((id, index) =>
          ctx.db.banner.update({
            where: { id },
            data: { position: index },
          })
        )
      );
      return { ok: true };
    }),

  getTopProducts: adminProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true, price: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });
    const items = rows as AdminTopProductGroupRow[];

    const productIds = items.map((i) => i.productId);
    const products = await ctx.db.product.findMany({
      where: { id: { in: productIds } },
      include: { images: { take: 1, orderBy: { position: 'asc' } } },
    });

    return items.map((item) => {
      const product = products.find((p: ProductWithThumb) => p.id === item.productId);
      return {
        id: item.productId,
        name: product?.name ?? 'Sản phẩm đã xóa',
        image: product?.images[0]?.url ?? '',
        totalSold: item._sum.quantity ?? 0,
        revenue: (item._sum.price ?? 0) * (item._sum.quantity ?? 0),
      };
    });
  }),
});
