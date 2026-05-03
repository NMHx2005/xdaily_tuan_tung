import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';
import { SITE_NAME } from '@/lib/constants';
import { router, publicProcedure, adminProcedure } from '@/server/trpc/trpc';

const blogInclude = {
  select: {
    id: true,
    slug: true,
    title: true,
    excerpt: true,
    thumbnail: true,
    author: true,
    tags: true,
    publishedAt: true,
    createdAt: true,
  },
} as const;

export const blogRouter = router({
  /** Admin: tất cả bài (nháp + đã đăng), có phân trang & tìm theo tiêu đề */
  listForAdmin: adminProcedure
    .input(
      z
        .object({
          page: z.number().int().positive().default(1),
          limit: z.number().int().positive().max(50).default(20),
          q: z.string().optional(),
          published: z.enum(['all', 'published', 'draft']).optional(),
        })
        .default({ page: 1, limit: 20 })
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;
      const term = input.q?.trim();
      const and: Prisma.BlogPostWhereInput[] = [];
      if (term) {
        and.push({ title: { contains: term, mode: 'insensitive' } });
      }
      if (input.published === 'published') {
        and.push({ isPublished: true });
      } else if (input.published === 'draft') {
        and.push({ isPublished: false });
      }
      const where: Prisma.BlogPostWhereInput | undefined =
        and.length > 0 ? { AND: and } : undefined;

      const [items, total] = await Promise.all([
        ctx.db.blogPost.findMany({
          where,
          skip,
          take: input.limit,
          orderBy: { updatedAt: 'desc' },
          select: {
            id: true,
            slug: true,
            title: true,
            excerpt: true,
            thumbnail: true,
            author: true,
            tags: true,
            isPublished: true,
            publishedAt: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        ctx.db.blogPost.count({ where }),
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

  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.blogPost.findUnique({ where: { id: input.id } });
      if (!post) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Không tìm thấy bài viết' });
      }
      return post;
    }),

  getAll: publicProcedure
    .input(
      z.object({
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(50).default(12),
      }).default({ page: 1, limit: 12 })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit } = input;
      const skip = (page - 1) * limit;

      const where = { isPublished: true };

      const [items, total] = await Promise.all([
        ctx.db.blogPost.findMany({
          where,
          skip,
          take: limit,
          orderBy: { publishedAt: 'desc' },
          ...blogInclude,
        }),
        ctx.db.blogPost.count({ where }),
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
      const post = await ctx.db.blogPost.findFirst({
        where: { slug: input.slug, isPublished: true },
      });

      if (!post) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Không tìm thấy bài viết' });
      }

      return post;
    }),

  getRecent: publicProcedure
    .input(
      z.object({ limit: z.number().int().positive().max(20).default(6) })
        .default({ limit: 6 })
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.blogPost.findMany({
        where: { isPublished: true },
        take: input.limit,
        orderBy: { publishedAt: 'desc' },
        ...blogInclude,
      });
    }),

  create: adminProcedure
    .input(
      z.object({
        slug: z.string().min(1),
        title: z.string().min(1),
        excerpt: z.string().max(300).default(''),
        content: z.string().default(''),
        thumbnail: z.string().nullable().default(null),
        author: z.string().default(SITE_NAME),
        tags: z.array(z.string()).default([]),
        isPublished: z.boolean().default(false),
        publishedAt: z.coerce.date().nullable().optional(),
        seoTitle: z.string().default(''),
        seoDescription: z.string().default(''),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { publishedAt: pubIn, ...rest } = input;
      let publishedAt: Date | null = null;
      if (input.isPublished) {
        publishedAt = pubIn ?? new Date();
      }
      return ctx.db.blogPost.create({
        data: {
          ...rest,
          publishedAt,
        },
      });
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        slug: z.string().optional(),
        title: z.string().optional(),
        excerpt: z.string().max(300).optional(),
        content: z.string().optional(),
        thumbnail: z.string().nullable().optional(),
        author: z.string().optional(),
        tags: z.array(z.string()).optional(),
        isPublished: z.boolean().optional(),
        publishedAt: z.coerce.date().nullable().optional(),
        seoTitle: z.string().optional(),
        seoDescription: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, isPublished, publishedAt: pubAt, ...data } = input;

      const updateData: Record<string, unknown> = { ...data };
      if (isPublished !== undefined) {
        updateData.isPublished = isPublished;
        if (isPublished) {
          const existing = await ctx.db.blogPost.findUnique({ where: { id } });
          if (pubAt !== undefined) {
            updateData.publishedAt = pubAt;
          } else if (!existing?.publishedAt) {
            updateData.publishedAt = new Date();
          }
        } else {
          updateData.publishedAt = null;
        }
      } else if (pubAt !== undefined) {
        updateData.publishedAt = pubAt;
      }

      return ctx.db.blogPost.update({ where: { id }, data: updateData });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.blogPost.delete({ where: { id: input.id } });
      } catch {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Bài viết không tồn tại' });
      }
    }),
});
