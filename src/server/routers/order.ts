import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure, adminProcedure } from '@/server/trpc/trpc';
import { shippingSchema } from '@/lib/validators';
import { generateOrderNumber } from '@/lib/utils';
import { FREE_SHIPPING_THRESHOLD, DEFAULT_SHIPPING_FEE } from '@/lib/constants';
import { createVnpayPaymentUrl } from '@/lib/payment/vnpay';
import { sendOrderConfirmationEmail } from '@/lib/emails/send-order-confirmation';

/** Matches `product.findMany` include in `create` (images + variants). */
type ProductForCheckout = {
  id: string;
  name: string;
  price: number;
  inStock: boolean;
  stockQuantity: number;
  images: { url: string }[];
  variants: { id: string; name: string; inStock: boolean; price: number }[];
};

export const orderRouter = router({
  create: publicProcedure
    .input(
      z.object({
        shipping: shippingSchema,
        paymentMethod: z.enum(['COD', 'VNPAY', 'MOMO']),
        items: z.array(
          z.object({
            productId: z.string(),
            variantId: z.string().nullable(),
            quantity: z.number().int().positive(),
          })
        ).min(1, 'Giỏ hàng trống'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { shipping, paymentMethod, items } = input;

      const uniqueProductIds = [...new Set(items.map((i) => i.productId))];
      const products = (await ctx.db.product.findMany({
        where: { id: { in: uniqueProductIds } },
        include: {
          images: { take: 1, orderBy: { position: 'asc' } },
          variants: true,
        },
      })) as ProductForCheckout[];

      if (products.length !== uniqueProductIds.length) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Một số sản phẩm không tồn tại' });
      }

      let subtotal = 0;
      const orderItems: {
        productId: string;
        variantId: string | null;
        name: string;
        variantName: string | null;
        price: number;
        quantity: number;
        image: string;
      }[] = [];

      for (const item of items) {
        const product = products.find((p) => p.id === item.productId);
        if (!product) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: `Sản phẩm không tồn tại` });
        }

        if (!product.inStock) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: `${product.name} đã hết hàng` });
        }

        let itemPrice = product.price;
        let variantName: string | null = null;

        if (item.variantId) {
          const variant = product.variants.find((v) => v.id === item.variantId);
          if (!variant) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: `Phiên bản sản phẩm không tồn tại` });
          }
          if (!variant.inStock) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: `${product.name} - ${variant.name} đã hết hàng` });
          }
          itemPrice = variant.price;
          variantName = variant.name;
        }

        if (product.stockQuantity > 0 && item.quantity > product.stockQuantity) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `${product.name} chỉ còn ${product.stockQuantity} sản phẩm`,
          });
        }

        subtotal += itemPrice * item.quantity;
        orderItems.push({
          productId: product.id,
          variantId: item.variantId,
          name: product.name,
          variantName,
          price: itemPrice,
          quantity: item.quantity,
          image: product.images[0]?.url ?? '',
        });
      }

      const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING_FEE;
      const total = subtotal + shippingFee;
      const orderNumber = generateOrderNumber();

      const order = await ctx.db.order.create({
        data: {
          orderNumber,
          userId: ctx.session?.user?.id ?? null,
          status: 'PENDING',
          paymentMethod,
          paymentStatus: 'PENDING',
          shippingName: shipping.fullName,
          shippingPhone: shipping.phone,
          shippingEmail: shipping.email,
          shippingAddress: shipping.address,
          shippingCity: shipping.city,
          shippingDistrict: shipping.district,
          shippingWard: shipping.ward,
          shippingNote: shipping.note || null,
          subtotal,
          shippingFee,
          discount: 0,
          total,
          items: {
            create: orderItems,
          },
        },
        include: { items: true },
      });

      void sendOrderConfirmationEmail(order);

      if (paymentMethod === 'VNPAY') {
        try {
          const paymentUrl = createVnpayPaymentUrl({
            orderId: order.id,
            amount: total,
            orderInfo: `Thanh toan don hang ${orderNumber}`,
            ipAddr: '127.0.0.1',
          });
          return { orderNumber, paymentUrl };
        } catch {
          return { orderNumber, paymentUrl: null };
        }
      }

      return { orderNumber, paymentUrl: null };
    }),

  getById: protectedProcedure
    .input(z.object({ orderNumber: z.string() }))
    .query(async ({ ctx, input }) => {
      const order = await ctx.db.order.findUnique({
        where: { orderNumber: input.orderNumber },
        include: { items: true },
      });

      if (!order) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Không tìm thấy đơn hàng' });
      }

      const isOwner = order.userId && order.userId === ctx.session.user.id;
      const isAdmin = ctx.session.user.role === 'ADMIN';
      if (!isOwner && !isAdmin) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Không có quyền xem đơn hàng này' });
      }

      return order;
    }),

  getMyOrders: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.order.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });
  }),

  getAll: adminProcedure
    .input(
      z
        .object({
          page: z.number().int().positive().default(1),
          limit: z.number().int().positive().max(100).default(20),
          status: z
            .enum([
              'PENDING',
              'CONFIRMED',
              'PROCESSING',
              'SHIPPING',
              'DELIVERED',
              'CANCELLED',
            ])
            .optional(),
        })
        .default({ page: 1, limit: 20 })
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;
      const where = input.status !== undefined ? { status: input.status } : undefined;

      const [items, total] = await Promise.all([
        ctx.db.order.findMany({
          where,
          skip,
          take: input.limit,
          orderBy: { createdAt: 'desc' },
          include: {
            items: true,
            user: { select: { id: true, name: true, email: true } },
          },
        }),
        ctx.db.order.count({ where }),
      ]);

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

  /** Chi tiết đơn theo id (admin) */
  getDetail: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const order = await ctx.db.order.findUnique({
        where: { id: input.id },
        include: {
          items: {
            include: {
              product: {
                select: { id: true, slug: true, name: true },
              },
            },
          },
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
      });

      if (!order) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Không tìm thấy đơn hàng' });
      }

      return order;
    }),

  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.order.update({
        where: { id: input.id },
        data: { status: input.status },
      });
    }),
});
