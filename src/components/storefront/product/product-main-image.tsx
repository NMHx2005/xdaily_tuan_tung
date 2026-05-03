"use client";

import Image from "next/image";
import { TINY_BLUR_DATA_URL } from "@/lib/blur-placeholder";

export interface ProductMainImageProps {
  url: string;
  alt: string;
  productName: string;
  priority?: boolean;
}

/** Ảnh chính PDP (không zoom). */
export default function ProductMainImage({
  url,
  alt,
  productName,
  priority = true,
}: ProductMainImageProps) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
      <Image
        src={url}
        alt={alt || productName}
        fill
        priority={priority}
        placeholder="blur"
        blurDataURL={TINY_BLUR_DATA_URL}
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover"
      />
    </div>
  );
}
