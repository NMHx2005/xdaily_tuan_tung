"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { TINY_BLUR_DATA_URL } from "@/lib/blur-placeholder";
import ProductMainImage from "./product-main-image";

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
  const n = allImages.length;

  function goPrev() {
    setSelectedIndex((i) => (i - 1 + n) % n);
  }

  function goNext() {
    setSelectedIndex((i) => (i + 1) % n);
  }

  if (!mainImage) {
    return (
      <div className="aspect-square rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-400">
        Chưa có ảnh
      </div>
    );
  }

  return (
    <div>
      <div className="relative">
        <ProductMainImage
          url={mainImage.url}
          alt={mainImage.alt || productName}
          productName={productName}
          priority
        />
        {n > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-2 top-1/2 z-[1] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white/95 shadow-sm transition-colors hover:bg-white"
              aria-label="Ảnh trước"
            >
              <ChevronLeft className="h-5 w-5 text-neutral-800" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-2 top-1/2 z-[1] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white/95 shadow-sm transition-colors hover:bg-white"
              aria-label="Ảnh sau"
            >
              <ChevronRight className="h-5 w-5 text-neutral-800" />
            </button>
          </>
        )}
      </div>

      {n > 1 && (
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
