"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { TINY_BLUR_DATA_URL } from "@/lib/blur-placeholder";

export interface MainZoomImageProps {
  url: string;
  alt: string;
  productName: string;
  priority?: boolean;
}

/**
 * Main product image with hover zoom (client-only; loaded via `next/dynamic` from `ProductGallery`).
 */
export default function ProductMainZoomImage({
  url,
  alt,
  productName,
  priority = true,
}: MainZoomImageProps) {
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  }

  return (
    <div
      className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100 cursor-crosshair"
      onMouseEnter={() => setIsZooming(true)}
      onMouseLeave={() => setIsZooming(false)}
      onMouseMove={handleMouseMove}
    >
      <Image
        src={url}
        alt={alt || productName}
        fill
        priority={priority}
        placeholder="blur"
        blurDataURL={TINY_BLUR_DATA_URL}
        sizes="(max-width: 768px) 100vw, 50vw"
        className={cn(
          "object-cover transition-transform duration-200",
          isZooming && "scale-150"
        )}
        style={
          isZooming ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : undefined
        }
      />
    </div>
  );
}
