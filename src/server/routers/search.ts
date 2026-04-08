import { z } from 'zod';
import { router, publicProcedure } from '@/server/trpc/trpc';

export const searchRouter = router({
  global: publicProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const { query } = input;

      const [products, blogs] = await Promise.all([
        ctx.db.product.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { shortDescription: { contains: query, mode: 'insensitive' } },
            ],
          },
          include: {
            images: { take: 2, orderBy: { position: 'asc' } },
            variants: true,
          },
          take: 20,
        }),
        ctx.db.blogPost.findMany({
          where: {
            isPublished: true,
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { excerpt: { contains: query, mode: 'insensitive' } },
            ],
          },
          select: {
            id: true,
            slug: true,
            title: true,
            excerpt: true,
            thumbnail: true,
            author: true,
            publishedAt: true,
          },
          take: 5,
        }),
      ]);

      return {
        products: products.map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          price: p.price,
          compareAtPrice: p.compareAtPrice,
          thumbnail: p.images[0]?.url ?? '',
          hoverImage: p.images[1]?.url ?? null,
          variantCount: p.variants.length,
          variantColors: p.variants
            .filter((v) => v.colorHex)
            .map((v) => v.colorHex),
          badge: p.badge as 'bestseller' | 'new' | null,
        })),
        blogs: blogs.map((b) => ({
          id: b.id,
          slug: b.slug,
          title: b.title,
          excerpt: b.excerpt ?? '',
          thumbnail: b.thumbnail,
          author: b.author,
          publishedAt: b.publishedAt,
        })),
      };
    }),
});
