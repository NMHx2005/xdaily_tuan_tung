import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, adminProcedure } from '@/server/trpc/trpc';

export const adminRouter = router({
  getBanners: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.banner.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' },
    });
  }),

  createBanner: adminProcedure
    .input(
      z.object({
        image: z.string().url(),
        mobileImage: z.string().url().nullable().default(null),
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
        image: z.string().url().optional(),
        mobileImage: z.string().url().nullable().optional(),
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
});
