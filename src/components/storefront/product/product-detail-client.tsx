"use client";

import { useState } from "react";
import { ProductGallery } from "./product-gallery";
import { ProductInfo } from "./product-info";

interface Variant {
  id: string;
  name: string;
  colorHex: string;
  price: number;
  compareAtPrice: number | null;
  sku: string;
  inStock: boolean;
  image: string | null;
}

interface ProductImage {
  id: string;
  url: string;
  alt: string;
}

interface ProductDetailClientProps {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  inStock: boolean;
  stockQuantity: number;
  shortDescription: string;
  images: ProductImage[];
  variants: Variant[];
}

export function ProductDetailClient(props: ProductDetailClientProps) {
  const [activeVariantImage, setActiveVariantImage] = useState<string | null>(null);

  const thumbnail = props.images[0]?.url ?? "/placeholder.png";

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <ProductGallery
        images={props.images}
        productName={props.name}
        activeVariantImage={activeVariantImage}
      />
      <ProductInfo
        id={props.id}
        slug={props.slug}
        name={props.name}
        price={props.price}
        compareAtPrice={props.compareAtPrice}
        inStock={props.inStock}
        stockQuantity={props.stockQuantity}
        shortDescription={props.shortDescription}
        variants={props.variants}
        thumbnail={thumbnail}
        onVariantChange={(v) => setActiveVariantImage(v?.image ?? null)}
      />
    </div>
  );
}
