import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ProductCardData } from "@/types";
import { createCaller } from "@/lib/trpc/server";
import { absoluteUrl, getSiteUrl } from "@/lib/seo";
import { Breadcrumbs } from "@/components/storefront/collection/breadcrumbs";
import { ProductDetailClient } from "@/components/storefront/product/product-detail-client";
import { ProductReviews } from "@/components/storefront/product/product-reviews";
import { RelatedProducts } from "@/components/storefront/product/related-products";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const trpc = await createCaller();

  try {
    const product = await trpc.product.getBySlug({ slug });
    const title = product.seoTitle || product.name;
    const description = product.seoDescription || product.shortDescription || product.name;
    const ogImages = product.images.length
      ? product.images.map((i) => ({ url: absoluteUrl(i.url), alt: i.alt }))
      : [{ url: absoluteUrl("/globe.svg"), alt: product.name }];
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `/products/${product.slug}`,
        type: "website",
        images: ogImages,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: ogImages.map((i) => (typeof i.url === "string" ? i.url : String(i.url))),
      },
      alternates: {
        canonical: `/products/${product.slug}`,
      },
    };
  } catch {
    return {};
  }
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

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const trpc = await createCaller();

  let product;
  try {
    product = await trpc.product.getBySlug({ slug });
  } catch {
    notFound();
  }

  const [reviews, relatedRaw] = await Promise.all([
    trpc.review.getByProduct({ productId: product.id }),
    trpc.product.getRelated({ productId: product.id, limit: 8 }),
  ]);

  const relatedProducts = relatedRaw.map(toProductCard);

  const collectionInfo = product.collections[0]?.collection;

  const breadcrumbItems = collectionInfo
    ? [
        { label: collectionInfo.name, href: `/collections/${collectionInfo.slug}` },
        { label: product.name },
      ]
    : [{ label: product.name }];

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : undefined;

  const base = getSiteUrl();
  const productUrl = `${base}/products/${product.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images.map((i) => absoluteUrl(i.url)),
    description: product.shortDescription || product.description,
    brand: { "@type": "Brand", name: "XDAILY" },
    sku: product.sku,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "VND",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: productUrl,
    },
    ...(reviews.length > 0 && avgRating !== undefined
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: avgRating.toFixed(1),
            reviewCount: reviews.length,
          },
        }
      : {}),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Trang chủ",
        item: base,
      },
      ...(collectionInfo
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: collectionInfo.name,
              item: `${base}/collections/${collectionInfo.slug}`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: product.name,
              item: productUrl,
            },
          ]
        : [
            {
              "@type": "ListItem",
              position: 2,
              name: product.name,
              item: productUrl,
            },
          ]),
    ],
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Breadcrumbs items={breadcrumbItems} />

      {/* Gallery + Info */}
      <ProductDetailClient
        id={product.id}
        slug={product.slug}
        name={product.name}
        price={product.price}
        compareAtPrice={product.compareAtPrice}
        inStock={product.inStock}
        stockQuantity={product.stockQuantity}
        shortDescription={product.shortDescription}
        images={product.images}
        variants={product.variants}
      />

      {/* Description */}
      {product.description && (
        <section className="mt-12">
          <h2 className="font-heading text-xl font-bold">Mô tả sản phẩm</h2>
          <div
            className="prose prose-neutral mt-4 max-w-none"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </section>
      )}

      {/* Specifications */}
      {Array.isArray(product.specifications) &&
        (product.specifications as { key: string; value: string }[]).length > 0 && (
          <section className="mt-12">
            <h2 className="font-heading text-xl font-bold">Thông số kỹ thuật</h2>
            <div className="mt-4 overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <tbody>
                  {(product.specifications as { key: string; value: string }[]).map(
                    (spec, i) => (
                      <tr
                        key={i}
                        className={i % 2 === 0 ? "bg-neutral-50" : "bg-white"}
                      >
                        <td className="px-4 py-2.5 font-medium text-neutral-700 w-1/3">
                          {spec.key}
                        </td>
                        <td className="px-4 py-2.5 text-neutral-600">
                          {spec.value}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

      {/* Reviews */}
      <ProductReviews productId={product.id} reviews={reviews} />

      {/* Related products */}
      <RelatedProducts products={relatedProducts} />
    </div>
  );
}
