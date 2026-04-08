"use client";

import type { ProductCardData } from "@/types";
import { CountdownTimer } from "./countdown-timer";
import { ProductGrid } from "@/components/storefront/product/product-grid";

interface FlashSaleData {
  id: string;
  name: string;
  endsAt: Date;
  items: {
    id: string;
    salePrice: number;
    product: {
      id: string;
      slug: string;
      name: string;
      price: number;
      images: { url: string; alt: string }[];
      variants: { colorHex: string }[];
      badge: string | null;
    };
  }[];
}

interface FlashSaleSectionProps {
  flashSale: FlashSaleData;
}

export function FlashSaleSection({ flashSale }: FlashSaleSectionProps) {
  const products: ProductCardData[] = flashSale.items.map((item) => ({
    id: item.product.id,
    slug: item.product.slug,
    name: item.product.name,
    price: item.salePrice,
    compareAtPrice: item.product.price,
    thumbnail: item.product.images[0]?.url ?? "/placeholder.png",
    hoverImage: item.product.images[1]?.url ?? null,
    variantCount: item.product.variants.length,
    variantColors: item.product.variants
      .map((v) => v.colorHex)
      .filter(Boolean),
    badge: (item.product.badge as ProductCardData["badge"]) ?? null,
  }));

  if (products.length === 0) return null;

  return (
    <section className="bg-gradient-to-b from-red-50 to-white py-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-heading text-2xl font-bold text-red-600 lg:text-3xl">
            {flashSale.name || "Sản phẩm khuyến mãi"}
          </h2>
          <CountdownTimer endsAt={flashSale.endsAt} />
        </div>
        <ProductGrid products={products} columns={4} />
      </div>
    </section>
  );
}
