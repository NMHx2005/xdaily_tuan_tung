import { db } from "@/server/db";
import { getSiteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const base = getSiteUrl();

  const [products, collections, posts] = await Promise.all([
    db.product.findMany({ select: { slug: true, updatedAt: true } }),
    db.collection.findMany({
      where: { isVisible: true },
      select: { slug: true, updatedAt: true },
    }),
    db.blogPost.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const urls: { loc: string; lastmod: string }[] = [];

  const staticPaths = [
    "/",
    "/contact",
    "/about",
    "/huong-dan-mua-hang",
    "/chinh-sach-doi-tra",
    "/chinh-sach-van-chuyen",
    "/faq",
    "/chinh-sach-bao-mat",
    "/dieu-khoan-su-dung",
  ];
  const staticLastmod = new Date().toISOString();
  for (const path of staticPaths) {
    urls.push({
      loc: `${base}${path}`,
      lastmod: staticLastmod,
    });
  }

  const latestProductUpdate = products.reduce<Date | null>(
    (acc, p) => (acc && acc > p.updatedAt ? acc : p.updatedAt),
    products[0]?.updatedAt ?? null,
  );
  urls.push({
    loc: `${base}/collections`,
    lastmod: (latestProductUpdate ?? new Date()).toISOString(),
  });

  for (const p of products) {
    urls.push({
      loc: `${base}/products/${p.slug}`,
      lastmod: p.updatedAt.toISOString(),
    });
  }
  for (const c of collections) {
    urls.push({
      loc: `${base}/collections/${c.slug}`,
      lastmod: c.updatedAt.toISOString(),
    });
  }
  for (const b of posts) {
    urls.push({
      loc: `${base}/blogs/${b.slug}`,
      lastmod: b.updatedAt.toISOString(),
    });
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${escapeXml(u.lastmod)}</lastmod>
  </url>`,
  )
  .join("\n")}
</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
