import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ProductCardData } from "@/types";
import { createCaller } from "@/lib/trpc/server";
import { db } from "@/server/db";
import { PRODUCTS_PER_PAGE } from "@/lib/constants";
import { absoluteUrl, DEFAULT_OG_IMAGE_PATH, getSiteUrl } from "@/lib/seo";
import { buildCollectionBreadcrumbTrail } from "@/lib/storefront-nav";
import { Breadcrumbs } from "@/components/storefront/collection/breadcrumbs";
import { CollectionHeader } from "@/components/storefront/collection/collection-header";
import { FilterSortBar } from "@/components/storefront/collection/filter-sort-bar";
import { ProductGrid } from "@/components/storefront/product/product-grid";
import { Pagination } from "@/components/storefront/collection/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { Package } from "lucide-react";

export const revalidate = 30;

type SortValue = "featured" | "price-asc" | "price-desc" | "name-asc" | "name-desc" | "newest" | "bestselling";

const validSorts = new Set<string>([
  "featured", "price-asc", "price-desc", "name-asc", "name-desc", "newest", "bestselling",
]);

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const trpc = await createCaller();

  try {
    const collection = await trpc.collection.getBySlug({ slug });
    const title = collection.seoTitle || `${collection.name}`;
    const description =
      collection.seoDescription || `Bộ sưu tập ${collection.name} tại XDAILY — nội thất cao cấp.`;
    const ogImage = collection.image ? absoluteUrl(collection.image) : absoluteUrl(DEFAULT_OG_IMAGE_PATH);
    return {
      title,
      description,
      openGraph: {
        title: `${collection.name} | XDAILY`,
        description,
        type: "website",
        url: `/collections/${collection.slug}`,
        images: [{ url: ogImage, alt: collection.name }],
      },
      alternates: {
        canonical: `/collections/${collection.slug}`,
      },
    };
  } catch {
    return {};
  }
}

export async function generateStaticParams() {
  const collections = await db.collection.findMany({
    where: { isVisible: true },
    select: { slug: true },
  });
  return collections.map((c) => ({ slug: c.slug }));
}

function toProductCard(product: {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  badge: string | null;
  images: { url: string; alt: string }[];
  variants: { colorHex: string }[];
}): ProductCardData {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    thumbnail: product.images[0]?.url ?? "/placeholder.png",
    hoverImage: product.images[1]?.url ?? null,
    variantCount: product.variants.length,
    variantColors: product.variants.map((v) => v.colorHex).filter(Boolean),
    badge: (product.badge as ProductCardData["badge"]) ?? null,
  };
}

export default async function CollectionPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;

  const rawPage = typeof sp.page === "string" ? parseInt(sp.page, 10) : 1;
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const rawSort = typeof sp.sort === "string" ? sp.sort : "featured";
  const sort = (validSorts.has(rawSort) ? rawSort : "featured") as SortValue;

  const trpc = await createCaller();

  const navTree = await trpc.collection.getStorefrontNavTree();

  let result;
  try {
    result = await trpc.product.getByCollection({
      collectionSlug: slug,
      page,
      limit: PRODUCTS_PER_PAGE,
      sort,
    });
  } catch {
    notFound();
  }

  const { collection, items, total, totalPages } = result;
  const products = items.map(toProductCard);

  const sortParams: Record<string, string> = {};
  if (sort !== "featured") sortParams.sort = sort;

  const base = getSiteUrl();
  const collectionUrl = `${base}/collections/${collection.slug}`;
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: collection.name,
    ...(collection.description ? { description: collection.description } : {}),
    url: collectionUrl,
    isPartOf: { "@type": "WebSite", name: "XDAILY", url: base },
  };
  const navTrail = buildCollectionBreadcrumbTrail(navTree, slug);
  const breadcrumbItems = navTrail
    ? navTrail.map((seg, i, arr) =>
      i < arr.length - 1
        ? { label: seg.label, href: seg.href }
        : {
          label: seg.label,
          jsonLdHref: `/collections/${slug}`,
        },
    )
    : [{ label: collection.name, jsonLdHref: `/collections/${slug}` }];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />

      <Breadcrumbs items={breadcrumbItems} />

      <CollectionHeader
        name={collection.name}
        description={collection.description ?? null}
        productCount={total}
      />

      <FilterSortBar
        currentSort={sort}
        totalProducts={total}
        collectionName={collection.name}
      />

      {products.length > 0 ? (
        <ProductGrid products={products} columns={4} />
      ) : (
        <EmptyState
          icon={Package}
          title="Chưa có sản phẩm"
          description="Danh mục này chưa có sản phẩm. Vui lòng quay lại sau hoặc xem các bộ sưu tập khác."
          actionLabel="Về trang chủ"
          actionHref="/"
        />
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        baseUrl={`/collections/${slug}`}
        searchParams={sortParams}
      />

      {collection.description && (
        <div className="mt-12 border-t pt-8">
          <h2 className="font-heading text-xl font-bold">
            Về {collection.name}
          </h2>
          <p className="mt-2 leading-relaxed text-neutral-600">
            {collection.description}
          </p>
        </div>
      )}
    </div>
  );
}
