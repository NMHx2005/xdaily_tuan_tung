import { z } from 'zod';
import { TRPCError } from '@trpc/server';
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
        excerpt: z.string().default(''),
        content: z.string().default(''),
        thumbnail: z.string().nullable().default(null),
        author: z.string().default('XDAILY'),
        tags: z.array(z.string()).default([]),
        isPublished: z.boolean().default(false),
        seoTitle: z.string().default(''),
        seoDescription: z.string().default(''),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.blogPost.create({
        data: {
          ...input,
          publishedAt: input.isPublished ? new Date() : null,
        },
      });
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        slug: z.string().optional(),
        title: z.string().optional(),
        excerpt: z.string().optional(),
        content: z.string().optional(),
        thumbnail: z.string().nullable().optional(),
        author: z.string().optional(),
        tags: z.array(z.string()).optional(),
        isPublished: z.boolean().optional(),
        seoTitle: z.string().optional(),
        seoDescription: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, isPublished, ...data } = input;

      const updateData: Record<string, unknown> = { ...data };
      if (isPublished !== undefined) {
        updateData.isPublished = isPublished;
        if (isPublished) {
          const existing = await ctx.db.blogPost.findUnique({ where: { id } });
          if (!existing?.publishedAt) {
            updateData.publishedAt = new Date();
          }
        }
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
