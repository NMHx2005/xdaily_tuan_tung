import type { Metadata } from "next";
import type { ProductCardData } from "@/types";
import { createCaller } from "@/lib/trpc/server";
import { HeroBanner } from "@/components/storefront/home/hero-banner";
import { FlashSaleSection } from "@/components/storefront/home/flash-sale-section";
import { ProductSection } from "@/components/storefront/home/product-section";
import { BlogPreview } from "@/components/storefront/home/blog-preview";
import { NewsletterForm } from "@/components/storefront/home/newsletter-form";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "XDAILY - Nhà máy nội thất cao cấp",
  description:
    "XDAILY cung cấp ghế ăn, bàn trà, ghế bar, sofa, giường ngủ cao cấp. Thiết kế hiện đại, giá tốt nhất.",
  openGraph: {
    title: "XDAILY - Nhà máy nội thất cao cấp",
    description:
      "XDAILY cung cấp ghế ăn, bàn trà, ghế bar, sofa, giường ngủ cao cấp. Thiết kế hiện đại, giá tốt nhất.",
    type: "website",
    url: "https://xdaily.vn",
  },
};

function toProductCard(
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    compareAtPrice: number | null;
    badge: string | null;
    images: { url: string; alt: string }[];
    variants: { colorHex: string }[];
  },
): ProductCardData {
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

export default async function HomePage() {
  const trpc = await createCaller();

  const [
    banners,
    flashSale,
    newArrivals,
    bestsellers,
    chairsResult,
    coffeeTablesResult,
    barStoolsResult,
    recentBlogs,
  ] = await Promise.all([
    trpc.admin.getBanners(),
    trpc.product.getFlashSale(),
    trpc.product.getNewArrivals(),
    trpc.product.getBestsellers(),
    trpc.product.getByCollection({ collectionSlug: "ghe-an", limit: 10, page: 1, sort: "featured" }).catch(() => null),
    trpc.product.getByCollection({ collectionSlug: "ban-tra", limit: 10, page: 1, sort: "featured" }).catch(() => null),
    trpc.product.getByCollection({ collectionSlug: "ghe-bar", limit: 10, page: 1, sort: "featured" }).catch(() => null),
    trpc.blog.getRecent({ limit: 6 }),
  ]);

  const newArrivalCards = newArrivals.map(toProductCard);
  const bestsellerCards = bestsellers.map(toProductCard);
  const chairCards = chairsResult?.items.map(toProductCard) ?? [];
  const coffeeTableCards = coffeeTablesResult?.items.map(toProductCard) ?? [];
  const barStoolCards = barStoolsResult?.items.map(toProductCard) ?? [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "XDAILY",
        url: "https://xdaily.vn",
        logo: "https://xdaily.vn/logo.png",
        sameAs: [
          "https://www.facebook.com/xdaily.vn",
          "https://www.instagram.com/xdaily.vn",
        ],
      },
      {
        "@type": "WebSite",
        name: "XDAILY - Nhà máy nội thất cao cấp",
        url: "https://xdaily.vn",
        potentialAction: {
          "@type": "SearchAction",
          target: "https://xdaily.vn/search?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <HeroBanner banners={banners} />

      {flashSale && <FlashSaleSection flashSale={flashSale} />}

      <ProductSection
        title="Sản phẩm mới"
        viewAllLink="/collections/san-pham-moi"
        products={newArrivalCards}
      />

      <ProductSection
        title="Sản phẩm bán chạy"
        viewAllLink="/collections/ban-chay"
        products={bestsellerCards}
      />

      {chairCards.length > 0 && (
        <ProductSection
          title="Ghế"
          viewAllLink="/collections/ghe-an"
          products={chairCards}
        />
      )}

      {coffeeTableCards.length > 0 && (
        <ProductSection
          title="Bàn trà"
          viewAllLink="/collections/ban-tra"
          products={coffeeTableCards}
        />
      )}

      {barStoolCards.length > 0 && (
        <ProductSection
          title="Ghế bar"
          viewAllLink="/collections/ghe-bar"
          products={barStoolCards}
        />
      )}

      <BlogPreview posts={recentBlogs} />

      <NewsletterForm />
    </>
  );
}
