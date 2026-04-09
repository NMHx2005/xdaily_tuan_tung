import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure, adminProcedure } from '@/server/trpc/trpc';

/** Matches `findMany` `select` in `getAll`. */
type CustomerAdminListUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  image: string | null;
  createdAt: Date;
  _count: { orders: number };
};

type OrderSpendByUserRow = { userId: string; _sum: { total: number | null } };

export const userRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2, 'Tên tối thiểu 2 ký tự').optional(),
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: input,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      });
    }),

  getAll: adminProcedure
    .input(
      z
        .object({
          page: z.number().int().positive().default(1),
          limit: z.number().int().positive().max(100).default(20),
          q: z.string().optional(),
        })
        .default({ page: 1, limit: 20 })
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;
      const term = input.q?.trim();

      const where = {
        role: 'CUSTOMER' as const,
        ...(term && {
          OR: [
            { name: { contains: term, mode: 'insensitive' as const } },
            { email: { contains: term, mode: 'insensitive' as const } },
          ],
        }),
      };

      const [users, total] = await Promise.all([
        ctx.db.user.findMany({
          where,
          skip,
          take: input.limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
            createdAt: true,
            _count: { select: { orders: true } },
          },
        }),
        ctx.db.user.count({ where }),
      ]);

      const customerRows = users as CustomerAdminListUser[];
      const ids = customerRows.map((u) => u.id);
      let spending: OrderSpendByUserRow[];
      if (ids.length === 0) {
        spending = [];
      } else {
        const rows = await ctx.db.order.groupBy({
          by: ['userId'],
          where: { userId: { in: ids }, status: 'DELIVERED' },
          _sum: { total: true },
        });
        spending = rows as OrderSpendByUserRow[];
      }

      const spendMap = Object.fromEntries(
        spending.map((s) => [s.userId, s._sum.total ?? 0])
      );

      const items = customerRows.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        image: u.image,
        createdAt: u.createdAt,
        orderCount: u._count.orders,
        totalSpent: spendMap[u.id] ?? 0,
      }));

      const totalPages = Math.ceil(total / input.limit) || 1;

      return {
        items,
        total,
        page: input.page,
        totalPages,
        hasNext: input.page < totalPages,
        hasPrev: input.page > 1,
      };
    }),

  getCustomerDetail: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findFirst({
        where: { id: input.id, role: 'CUSTOMER' },
        include: {
          orders: {
            take: 15,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              orderNumber: true,
              total: true,
              status: true,
              createdAt: true,
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Không tìm thấy khách hàng' });
      }

      const spent = await ctx.db.order.aggregate({
        _sum: { total: true },
        where: { userId: user.id, status: 'DELIVERED' },
      });

      return {
        ...user,
        totalSpent: spent._sum.total ?? 0,
      };
    }),
});
