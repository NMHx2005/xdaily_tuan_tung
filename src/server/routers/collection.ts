import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';
import type { Collection, PrismaClient } from '@prisma/client';
import { router, publicProcedure, adminProcedure } from '@/server/trpc/trpc';
import type { StorefrontNavItem } from '@/lib/storefront-nav';
import { collectionNavIconSchema } from '@/lib/collection-form-schema';
import { homeCategoryStripDefaultLabel } from '@/lib/home-category-strip';

async function assertValidParent(
  db: PrismaClient,
  nodeId: string,
  newParentId: string | null,
) {
  if (!newParentId) return;
  let cur: string | null = newParentId;
  while (cur) {
    if (cur === nodeId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Không thể chọn cha là chính nó hoặc danh mục con của nó',
      });
    }
    const row: { parentId: string | null } | null = await db.collection.findUnique({
      where: { id: cur },
      select: { parentId: true },
    });
    cur = row?.parentId ?? null;
  }
}

function buildStorefrontNavTree(rows: Collection[]): StorefrontNavItem[] {
  const ids = new Set(rows.map((r) => r.id));
  const childBuckets = new Map<string | null, Collection[]>();

  for (const r of rows) {
    const parentKey =
      r.parentId && ids.has(r.parentId) ? r.parentId : null;
    if (!childBuckets.has(parentKey)) childBuckets.set(parentKey, []);
    childBuckets.get(parentKey)!.push(r);
  }

  for (const list of childBuckets.values()) {
    list.sort(
      (a, b) => a.position - b.position || a.name.localeCompare(b.name, 'vi'),
    );
  }

  function toItem(r: Collection): StorefrontNavItem {
    const kids = childBuckets.get(r.id) ?? [];
    return {
      id: r.id,
      slug: r.slug,
      name: r.name,
      navLabel: r.navLabel?.trim() ? r.navLabel : null,
      navIcon: r.navIcon || 'Package',
      children: kids.map(toItem),
    };
  }

  const roots = childBuckets.get(null) ?? [];
  return roots.map(toItem);
}

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

  /** Cây danh mục cho sidebar / mega menu (chỉ bản hiển thị + hiện trên nav) */
  getStorefrontNavTree: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.collection.findMany({
      where: { isVisible: true, showInStorefrontNav: true },
      orderBy: { position: 'asc' },
    });
    return buildStorefrontNavTree(rows);
  }),

  /** Admin: tất cả danh mục (kể cả ẩn) — có đếm SP + cha + bộ lọc */
  getAllForAdmin: adminProcedure
    .input(
      z.object({
        q: z.string().optional(),
        isVisible: z.enum(['all', 'yes', 'no']).optional(),
        inStoreNav: z.enum(['all', 'yes', 'no']).optional(),
        level: z.enum(['all', 'root', 'child']).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const term = input.q?.trim();
      const vis = input.isVisible ?? 'all';
      const nav = input.inStoreNav ?? 'all';
      const level = input.level ?? 'all';

      const and: Prisma.CollectionWhereInput[] = [];
      if (term) {
        and.push({
          OR: [
            { name: { contains: term, mode: 'insensitive' } },
            { slug: { contains: term, mode: 'insensitive' } },
          ],
        });
      }
      if (vis === 'yes') {
        and.push({ isVisible: true });
      } else if (vis === 'no') {
        and.push({ isVisible: false });
      }
      if (nav === 'yes') {
        and.push({ showInStorefrontNav: true });
      } else if (nav === 'no') {
        and.push({ showInStorefrontNav: false });
      }
      if (level === 'root') {
        and.push({ parentId: null });
      } else if (level === 'child') {
        and.push({ parentId: { not: null } });
      }

      const where: Prisma.CollectionWhereInput | undefined =
        and.length > 0 ? { AND: and } : undefined;

      return ctx.db.collection.findMany({
        where,
        orderBy: { position: 'asc' },
        include: {
          _count: { select: { products: true } },
          parent: { select: { id: true, name: true, slug: true } },
        },
      });
    }),

  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const collection = await ctx.db.collection.findUnique({
        where: { id: input.id },
        include: {
          parent: { select: { id: true, name: true, slug: true } },
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

  /**
   * Dải icon trang chủ — dùng `$queryRaw` để không phụ thuộc Prisma Client đã `generate`
   * (tránh lỗi "Unknown argument" khi dev server giữ bản client cũ trong bộ nhớ).
   */
  getHomeCategoryStrip: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.$queryRaw<
      Array<{
        slug: string;
        name: string;
        image: string | null;
        homeStripLabel: string | null;
      }>
    >(Prisma.sql`
      SELECT c."slug", c."name", c."image", c."homeStripLabel"
      FROM "Collection" c
      WHERE c."isVisible" = true
        AND c."showOnHomeCategoryStrip" = true
      ORDER BY c."homeStripPosition" ASC, c."name" ASC
    `);
    return rows.map((c) => {
      const trimmed = c.image?.trim();
      const label =
        c.homeStripLabel?.trim() ||
        homeCategoryStripDefaultLabel(c.name);
      return {
        slug: c.slug,
        href: `/collections/${c.slug}`,
        label,
        imageUrl: trimmed || '/placeholder.png',
      };
    });
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
        parentId: z.string().nullable().optional(),
        navLabel: z.string().optional(),
        navIcon: collectionNavIconSchema.optional().default('Package'),
        showInStorefrontNav: z.boolean().optional().default(false),
        showOnHomeCategoryStrip: z.boolean().optional().default(false),
        homeStripPosition: z.number().int().optional().default(0),
        homeStripLabel: z.string().optional().default(''),
        seoTitle: z.string().default(''),
        seoDescription: z.string().default(''),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { parentId, ...rest } = input;
      if (parentId) {
        const p = await ctx.db.collection.findUnique({ where: { id: parentId } });
        if (!p) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Danh mục cha không tồn tại' });
        }
      }
      return ctx.db.collection.create({
        data: {
          ...rest,
          parentId: parentId ?? null,
          navLabel: input.navLabel ?? '',
        },
      });
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
        parentId: z.string().nullable().optional(),
        navLabel: z.string().nullable().optional(),
        navIcon: collectionNavIconSchema.optional(),
        showInStorefrontNav: z.boolean().optional(),
        showOnHomeCategoryStrip: z.boolean().optional(),
        homeStripPosition: z.number().int().optional(),
        homeStripLabel: z.string().nullable().optional(),
        seoTitle: z.string().optional(),
        seoDescription: z.string().optional(),
        /** Thay toàn bộ sản phẩm trong collection (theo thứ tự) */
        productIds: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, productIds, parentId, ...rest } = input;

      if (parentId !== undefined) {
        if (parentId) {
          const p = await ctx.db.collection.findUnique({ where: { id: parentId } });
          if (!p) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Danh mục cha không tồn tại' });
          }
        }
        await assertValidParent(ctx.db, id, parentId);
      }

      return ctx.db.$transaction(async (tx) => {
        const data: Prisma.CollectionUpdateInput = {};
        if (rest.slug !== undefined) data.slug = rest.slug;
        if (rest.name !== undefined) data.name = rest.name;
        if (rest.description !== undefined) data.description = rest.description;
        if (rest.image !== undefined) data.image = rest.image;
        if (rest.position !== undefined) data.position = rest.position;
        if (rest.isVisible !== undefined) data.isVisible = rest.isVisible;
        if (rest.navLabel !== undefined) data.navLabel = rest.navLabel ?? '';
        if (rest.navIcon !== undefined) data.navIcon = rest.navIcon;
        if (rest.showInStorefrontNav !== undefined)
          data.showInStorefrontNav = rest.showInStorefrontNav;
        if (rest.showOnHomeCategoryStrip !== undefined)
          data.showOnHomeCategoryStrip = rest.showOnHomeCategoryStrip;
        if (rest.homeStripPosition !== undefined)
          data.homeStripPosition = rest.homeStripPosition;
        if (rest.homeStripLabel !== undefined)
          data.homeStripLabel = rest.homeStripLabel ?? '';
        if (rest.seoTitle !== undefined) data.seoTitle = rest.seoTitle;
        if (rest.seoDescription !== undefined) data.seoDescription = rest.seoDescription;
        if (parentId !== undefined) {
          data.parent =
            parentId === null
              ? { disconnect: true }
              : { connect: { id: parentId } };
        }

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
            parent: { select: { id: true, name: true, slug: true } },
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
