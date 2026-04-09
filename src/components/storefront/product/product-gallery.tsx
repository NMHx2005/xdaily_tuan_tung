"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { TINY_BLUR_DATA_URL } from "@/lib/blur-placeholder";

const ProductMainZoomImage = dynamic(() => import("./product-main-zoom-image"), {
  ssr: false,
  loading: () => (
    <div className="aspect-square animate-pulse rounded-lg bg-neutral-100" aria-hidden />
  ),
});

interface ProductImage {
  id: string;
  url: string;
  alt: string;
}

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
  activeVariantImage?: string | null;
}

function ProductGalleryInner({
  images,
  productName,
  activeVariantImage,
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const allImages = activeVariantImage
    ? [{ id: "variant", url: activeVariantImage, alt: productName }, ...images]
    : images;

  const mainImage = allImages[selectedIndex] ?? allImages[0];

  if (!mainImage) {
    return (
      <div className="aspect-square rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-400">
        Chưa có ảnh
      </div>
    );
  }

  return (
    <div>
      <ProductMainZoomImage
        url={mainImage.url}
        alt={mainImage.alt || productName}
        productName={productName}
        priority
      />

      {allImages.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {allImages.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setSelectedIndex(i)}
              className={cn(
                "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition-colors",
                i === selectedIndex
                  ? "border-primary"
                  : "border-transparent hover:border-neutral-300"
              )}
            >
              <Image
                src={img.url}
                alt={img.alt || `${productName} ${i + 1}`}
                fill
                sizes="64px"
                loading="lazy"
                placeholder="blur"
                blurDataURL={TINY_BLUR_DATA_URL}
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** `key` trên ảnh biến thể reset chỉ số ảnh đang xem khi đổi variant. */
export function ProductGallery(props: ProductGalleryProps) {
  const k = props.activeVariantImage ?? "__default__";
  return <ProductGalleryInner key={k} {...props} />;
}
