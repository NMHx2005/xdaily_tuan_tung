import { z } from 'zod';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
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
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        passwordHash: true,
      },
    });
    if (!user) return null;
    const { passwordHash, ...rest } = user;
    return {
      ...rest,
      canChangePassword: !!passwordHash,
    };
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2, 'Tên tối thiểu 2 ký tự'),
        phone: z
          .string()
          .max(20, 'Số điện thoại tối đa 20 ký tự')
          .optional()
          .transform((s) => (s === undefined ? undefined : s.trim() === '' ? null : s.trim())),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          name: input.name,
          ...(input.phone !== undefined && { phone: input.phone }),
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      });
    }),

  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string().min(1, 'Nhập mật khẩu hiện tại'),
        newPassword: z.string().min(6, 'Mật khẩu mới tối thiểu 6 ký tự').max(72, 'Mật khẩu tối đa 72 ký tự'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { passwordHash: true },
      });

      if (!user?.passwordHash) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Tài khoản đăng nhập bằng Google không đổi mật khẩu tại đây.',
        });
      }

      const match = await bcrypt.compare(input.currentPassword, user.passwordHash);
      if (!match) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Mật khẩu hiện tại không đúng.',
        });
      }

      const passwordHash = await bcrypt.hash(input.newPassword, 12);
      await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { passwordHash },
      });

      return { ok: true as const };
    }),

  getAll: adminProcedure
    .input(
      z
        .object({
          page: z.number().int().positive().default(1),
          limit: z.number().int().positive().max(100).default(20),
          q: z.string().optional(),
          hasOrders: z.enum(['any', 'with', 'without']).optional(),
        })
        .default({ page: 1, limit: 20 })
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;
      const term = input.q?.trim();

      const and: Prisma.UserWhereInput[] = [{ role: 'CUSTOMER' }];
      if (term) {
        and.push({
          OR: [
            { name: { contains: term, mode: 'insensitive' } },
            { email: { contains: term, mode: 'insensitive' } },
            { phone: { contains: term, mode: 'insensitive' } },
          ],
        });
      }
      if (input.hasOrders === 'with') {
        and.push({ orders: { some: {} } });
      } else if (input.hasOrders === 'without') {
        and.push({ orders: { none: {} } });
      }

      const where: Prisma.UserWhereInput = { AND: and };

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
