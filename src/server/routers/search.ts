import { z } from 'zod';
import { router, publicProcedure } from '@/server/trpc/trpc';

/** Matches `product.findMany` shape in `global` (include images + variants). */
type GlobalSearchProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  badge: string | null;
  images: { url: string }[];
  variants: { colorHex: string | null }[];
};

/** Matches `blogPost.findMany` `select` in `global`. */
type GlobalSearchBlog = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  thumbnail: string | null;
  author: string | null;
  publishedAt: Date | null;
};

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

      const productRows = products as GlobalSearchProduct[];
      const blogRows = blogs as GlobalSearchBlog[];

      return {
        products: productRows.map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          price: p.price,
          compareAtPrice: p.compareAtPrice,
          thumbnail: p.images[0]?.url ?? '',
          hoverImage: p.images[1]?.url ?? null,
          variantCount: p.variants.length,
          variantColors: p.variants
            .map((v) => v.colorHex)
            .filter((hex): hex is string => Boolean(hex)),
          badge: (p.badge === 'bestseller' || p.badge === 'new') ? p.badge : null as 'bestseller' | 'new' | null,
        })),
        blogs: blogRows.map((b) => ({
          id: b.id,
          slug: b.slug,
          title: b.title,
          excerpt: b.excerpt ?? '',
          thumbnail: b.thumbnail,
          author: b.author ?? '',
          publishedAt: b.publishedAt,
        })),
      };
    }),
});
