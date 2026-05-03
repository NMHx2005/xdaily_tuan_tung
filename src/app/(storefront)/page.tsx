import type { Metadata } from "next";
import dynamic from "next/dynamic";
import type { ProductCardData } from "@/types";
import { createCaller } from "@/lib/trpc/server";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";
import { absoluteUrl, DEFAULT_OG_IMAGE_PATH, getSiteUrl } from "@/lib/seo";
import { Skeleton } from "@/components/ui/skeleton";
import { FlashSaleSection } from "@/components/storefront/home/flash-sale-section";
import { HomeCategoryStrip } from "@/components/storefront/home/home-category-strip";
import { CategorySidebar } from "@/components/storefront/home/category-sidebar";

const HeroBanner = dynamic(
  () =>
    import("@/components/storefront/home/hero-banner").then((m) => m.HeroBanner),
  {
    loading: () => (
      <div className="min-w-0 flex-1 bg-brand">
        <Skeleton className="h-[280px] w-full sm:h-[380px] lg:h-[352px]" />
      </div>
    ),
  }
);
import { ProductSection } from "@/components/storefront/home/product-section";
import { BlogPreview } from "@/components/storefront/home/blog-preview";
import { NewsletterForm } from "@/components/storefront/home/newsletter-form";
import { HomeFourBannerSection } from "@/components/storefront/home/home-four-banner-section";

export const revalidate = 60;

const homeTitle = `${SITE_NAME} `;
const homeDescription = SITE_DESCRIPTION;

export const metadata: Metadata = {
  title: { absolute: homeTitle },
  description: homeDescription,
  alternates: { canonical: "/" },
  openGraph: {
    title: homeTitle,
    description: homeDescription,
    type: "website",
    url: "/",
    images: [{ url: DEFAULT_OG_IMAGE_PATH, alt: SITE_NAME }],
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
    thumbnail: product.images[0]?.url ?? "/placeholders/product.svg",
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
    homeFourBanners,
    homeCategoryStrip,
    flashSale,
    newArrivals,
    bestsellers,
    chairsResult,
    coffeeTablesResult,
    barStoolsResult,
    recentBlogs,
  ] = await Promise.all([
    trpc.admin.getBanners(),
    trpc.admin.getHomeFourBanners(),
    trpc.collection.getHomeCategoryStrip(),
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

  const base = getSiteUrl();
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: base,
    logo: absoluteUrl("/logo.png"),
    description: `Nhà máy nội thất ${SITE_NAME}`,
  };
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: base,
    potentialAction: {
      "@type": "SearchAction",
      target: `${base}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-0 sm:px-4 lg:px-8">
        {/* isolate + z-index: cột hero/slide không che sidebar (hover link được) */}
        <div className="relative isolate flex flex-col gap-0 lg:flex-row lg:items-start">
          <CategorySidebar />
          <div className="relative z-0 min-w-0 flex-1 lg:mt-4 lg:pl-2">
            <HeroBanner banners={banners} />
          </div>
        </div>

        {homeCategoryStrip.length > 0 && (
          <HomeCategoryStrip items={homeCategoryStrip} />
        )}
      </div>

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

      <HomeFourBannerSection banners={homeFourBanners} />

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
