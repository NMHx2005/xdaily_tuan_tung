import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ProductCardData } from "@/types";
import { createCaller } from "@/lib/trpc/server";
import { db } from "@/server/db";
import { PRODUCTS_PER_PAGE } from "@/lib/constants";
import { Breadcrumbs } from "@/components/storefront/collection/breadcrumbs";
import { CollectionHeader } from "@/components/storefront/collection/collection-header";
import { FilterSortBar } from "@/components/storefront/collection/filter-sort-bar";
import { ProductGrid } from "@/components/storefront/product/product-grid";
import { Pagination } from "@/components/storefront/collection/pagination";

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
    return {
      title: collection.seoTitle || collection.name,
      description: collection.seoDescription || `Bộ sưu tập ${collection.name} tại XDAILY`,
      openGraph: {
        title: collection.name,
        description: collection.seoDescription || `Bộ sưu tập ${collection.name} tại XDAILY`,
        type: "website",
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <Breadcrumbs
        items={[
          { label: collection.name },
        ]}
      />

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
        <div className="py-20 text-center">
          <p className="text-lg text-neutral-500">
            Chưa có sản phẩm trong danh mục này.
          </p>
        </div>
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
