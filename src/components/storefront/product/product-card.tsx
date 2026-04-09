"use client";

import Image from "next/image";
import { toast } from "sonner";
import type { ProductCardData } from "@/types";
import { TINY_BLUR_DATA_URL } from "@/lib/blur-placeholder";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { useUIStore } from "@/stores/ui-store";
import { ViewportPrefetchLink } from "@/components/storefront/viewport-prefetch-link";

export function ProductCard({
  id,
  slug,
  name,
  price,
  compareAtPrice,
  thumbnail,
  hoverImage,
  variantCount,
  variantColors,
  badge,
}: ProductCardData) {
  const { addItem } = useCart();
  const openCartDrawer = useUIStore((s) => s.openCartDrawer);

  const isOnSale = compareAtPrice !== null && compareAtPrice > price;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: id,
      variantId: null,
      name,
      variantName: null,
      price,
      image: thumbnail,
      slug,
      maxStock: 99,
    });
    toast.success(`Đã thêm ${name} vào giỏ hàng`);
    openCartDrawer();
  }

  return (
    <ViewportPrefetchLink href={`/products/${slug}`} className="group block cursor-pointer">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
        <Image
          src={thumbnail}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          loading="lazy"
          placeholder="blur"
          blurDataURL={TINY_BLUR_DATA_URL}
          className={`object-cover transition-all duration-300 ${
            hoverImage
              ? "group-hover:opacity-0"
              : "group-hover:scale-105"
          }`}
        />
        {hoverImage && (
          <Image
            src={hoverImage}
            alt={`${name} - hover`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            loading="lazy"
            placeholder="blur"
            blurDataURL={TINY_BLUR_DATA_URL}
            className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        )}

        {badge && (
          <span
            className={`absolute left-2 top-2 rounded px-2 py-1 text-xs font-semibold text-white ${
              badge === "bestseller" ? "bg-red-500" : "bg-green-500"
            }`}
          >
            {badge === "bestseller" ? "Top sản phẩm bán chạy nhất" : "Mẫu mới vừa ra mắt"}
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 p-3 opacity-100 translate-y-0 lg:opacity-0 lg:translate-y-2 lg:group-hover:opacity-100 lg:group-hover:translate-y-0 transition-all duration-200">
          <button
            onClick={handleAddToCart}
            className="w-full rounded bg-primary py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Thêm vào giỏ
          </button>
        </div>
      </div>

      <h3 className="mt-3 text-sm font-medium text-neutral-800 line-clamp-2">
        {name}
      </h3>

      {variantCount > 0 && variantColors.length > 0 && (
        <div className="mt-1.5 flex items-center gap-1.5">
          {variantColors.slice(0, 4).map((color, i) => (
            <span
              key={i}
              className="h-3 w-3 rounded-full border border-neutral-300"
              style={{ backgroundColor: color }}
            />
          ))}
          {variantColors.length > 4 && (
            <span className="text-xs text-neutral-500">
              +{variantColors.length - 4} màu sắc
            </span>
          )}
        </div>
      )}

      <div className="mt-1.5 flex items-baseline gap-2">
        <span
          className={`text-base font-bold ${isOnSale ? "text-red-600" : "text-neutral-900"}`}
        >
          {formatPrice(price)}
        </span>
        {isOnSale && (
          <span className="text-sm text-neutral-400 line-through">
            {formatPrice(compareAtPrice!)}
          </span>
        )}
      </div>
    </ViewportPrefetchLink>
  );
}
