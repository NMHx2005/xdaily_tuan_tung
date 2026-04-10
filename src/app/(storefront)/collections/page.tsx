import type { Metadata } from "next";
import type { ProductCardData } from "@/types";
import { createCaller } from "@/lib/trpc/server";
import { PRODUCTS_PER_PAGE } from "@/lib/constants";
import { DEFAULT_OG_IMAGE_PATH, getSiteUrl } from "@/lib/seo";
import { Breadcrumbs } from "@/components/storefront/collection/breadcrumbs";
import { CollectionHeader } from "@/components/storefront/collection/collection-header";
import { FilterSortBar } from "@/components/storefront/collection/filter-sort-bar";
import { ProductGrid } from "@/components/storefront/product/product-grid";
import { Pagination } from "@/components/storefront/collection/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { Package } from "lucide-react";

export const revalidate = 30;

type SortValue =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc"
  | "newest"
  | "bestselling";

const validSorts = new Set<string>([
  "featured",
  "price-asc",
  "price-desc",
  "name-asc",
  "name-desc",
  "newest",
  "bestselling",
]);

const PAGE_TITLE = "Tất cả sản phẩm";
const PAGE_DESCRIPTION =
  "Xem toàn bộ sản phẩm nội thất XDAILY — ghế ăn, bàn trà, ghế bar, sofa và hơn thế nữa.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  openGraph: {
    title: `${PAGE_TITLE} | XDAILY`,
    description: PAGE_DESCRIPTION,
    type: "website",
    url: "/collections",
    images: [{ url: DEFAULT_OG_IMAGE_PATH, alt: "XDAILY" }],
  },
  alternates: {
    canonical: "/collections",
  },
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
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

export default async function AllProductsCollectionPage({
  searchParams,
}: PageProps) {
  const sp = await searchParams;

  const rawPage = typeof sp.page === "string" ? parseInt(sp.page, 10) : 1;
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const rawSort = typeof sp.sort === "string" ? sp.sort : "featured";
  const sort = (validSorts.has(rawSort) ? rawSort : "featured") as SortValue;

  const trpc = await createCaller();

  const result = await trpc.product.getAll({
    page,
    limit: PRODUCTS_PER_PAGE,
    sort,
  });

  const { items, total, totalPages } = result;
  const products = items.map(toProductCard);

  const sortParams: Record<string, string> = {};
  if (sort !== "featured") sortParams.sort = sort;

  const base = getSiteUrl();
  const pageUrl = `${base}/collections`;
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: pageUrl,
    isPartOf: { "@type": "WebSite", name: "XDAILY", url: base },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />

      <Breadcrumbs
        items={[
          {
            label: PAGE_TITLE,
            jsonLdHref: "/collections",
          },
        ]}
      />

      <CollectionHeader
        name={PAGE_TITLE}
        description={null}
        productCount={total}
      />

      <FilterSortBar
        currentSort={sort}
        totalProducts={total}
        collectionName=""
      />

      {products.length > 0 ? (
        <ProductGrid products={products} columns={4} />
      ) : (
        <EmptyState
          icon={Package}
          title="Chưa có sản phẩm"
          description="Hiện chưa có sản phẩm nào trong cửa hàng. Vui lòng quay lại sau."
          actionLabel="Về trang chủ"
          actionHref="/"
        />
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        baseUrl="/collections"
        searchParams={sortParams}
      />
    </div>
  );
}
