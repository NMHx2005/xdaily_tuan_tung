"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

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

export function ProductGallery({
  images,
  productName,
  activeVariantImage,
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const prevVariantImage = useRef(activeVariantImage);

  const allImages = activeVariantImage
    ? [{ id: "variant", url: activeVariantImage, alt: productName }, ...images]
    : images;

  useEffect(() => {
    if (activeVariantImage !== prevVariantImage.current) {
      setSelectedIndex(0);
      prevVariantImage.current = activeVariantImage;
    }
  }, [activeVariantImage]);

  const mainImage = allImages[selectedIndex] ?? allImages[0];

  if (!mainImage) {
    return (
      <div className="aspect-square rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-400">
        Chưa có ảnh
      </div>
    );
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  }

  return (
    <div>
      <div
        className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100 cursor-crosshair"
        onMouseEnter={() => setIsZooming(true)}
        onMouseLeave={() => setIsZooming(false)}
        onMouseMove={handleMouseMove}
      >
        <Image
          src={mainImage.url}
          alt={mainImage.alt || productName}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className={cn(
            "object-cover transition-transform duration-200",
            isZooming && "scale-150"
          )}
          style={
            isZooming
              ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }
              : undefined
          }
        />
      </div>

      {allImages.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {allImages.map((img, i) => (
            <button
              key={img.id}
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
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
