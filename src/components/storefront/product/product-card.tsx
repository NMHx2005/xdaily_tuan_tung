"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import type { ProductCardData } from "@/types";
import { TINY_BLUR_DATA_URL } from "@/lib/blur-placeholder";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import { ProductQuickViewDialog } from "@/components/storefront/product/product-quick-view-dialog";

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
  const [quickViewOpen, setQuickViewOpen] = React.useState(false);

  const isOnSale = compareAtPrice !== null && compareAtPrice > price;
  const discountPercent =
    isOnSale && compareAtPrice
      ? Math.max(1, Math.round((1 - price / compareAtPrice) * 100))
      : null;

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

  const productHref = `/products/${slug}`;

  return (
    <div className="product-block item group">
      <div className="product-img relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
        <Link
          href={productHref}
          className="absolute inset-0 z-0 block"
          aria-label={name}
        >
          <Image
            src={thumbnail}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            loading="lazy"
            placeholder="blur"
            blurDataURL={TINY_BLUR_DATA_URL}
            className={cn(
              "object-cover transition-all duration-300",
              hoverImage ? "group-hover:opacity-0" : "group-hover:scale-105",
            )}
          />
          {hoverImage && (
            <Image
              src={hoverImage}
              alt={`${name} — ảnh khác`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              loading="lazy"
              placeholder="blur"
              blurDataURL={TINY_BLUR_DATA_URL}
              className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
          )}
        </Link>

        {discountPercent !== null && (
          <div className="product-sale pointer-events-none absolute left-2 top-2 z-5">
            <span className="inline-block rounded bg-brand px-2 py-0.5 text-xs font-bold text-white shadow-sm">
              -{discountPercent}%
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={handleAddToCart}
          className={cn(
            "group/atc absolute bottom-2 right-2 z-20 flex h-10 max-w-10 items-center justify-end overflow-hidden rounded-full bg-brand shadow-md transition-[max-width] duration-300 ease-out",
            "hover:max-w-[min(260px,calc(100vw-2rem))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-100",
          )}
          aria-label={`Thêm ${name} vào giỏ`}
        >
          <span className="min-w-0 shrink whitespace-nowrap py-2 pl-3 text-left text-sm font-medium text-white opacity-0 transition-opacity duration-200 group-hover/atc:opacity-100">
            Thêm vào giỏ
          </span>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">
            <ShoppingBag className="h-5 w-5 text-brand" strokeWidth={2} aria-hidden />
          </span>
        </button>

        <div
          className={cn(
            "pointer-events-none absolute inset-0 z-10 hidden opacity-0 transition-opacity duration-200 lg:block",
            "lg:group-hover:opacity-100",
          )}
        >
          <div className="absolute inset-0 bg-black/10 pointer-events-none" aria-hidden />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setQuickViewOpen(true);
            }}
            className="button-loop-pro pointer-events-auto absolute left-1/2 top-1/2 z-11 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md transition-transform hover:scale-105"
            aria-label="Xem nhanh"
          >
            <Search className="h-5 w-5 text-neutral-800" strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="product-detail mt-3">
        <h3 className="pro-name text-sm font-medium leading-snug text-neutral-900">
          <Link
            href={productHref}
            className="line-clamp-2 hover:text-brand"
          >
            {name}
          </Link>
        </h3>

        {variantCount > 0 && variantColors.length > 0 && (
          <ul className="mt-1.5 list-none text-xs text-neutral-500">
            <li>+{variantCount} màu sắc</li>
          </ul>
        )}

        <div className="box-pro-prices mt-1.5">
          <p className="pro-price flex flex-wrap items-baseline gap-2">
            <span
              className={cn(
                "text-base font-bold",
                isOnSale ? "text-brand" : "text-neutral-900",
              )}
            >
              {formatPrice(price)}
            </span>
            {isOnSale && (
              <del className="compare-price text-sm text-neutral-400">
                {formatPrice(compareAtPrice!)}
              </del>
            )}
          </p>
        </div>

        {badge === "bestseller" && (
          <ul className="hash-tag-loop mt-2 list-none">
            <li className="rounded border border-neutral-200 bg-neutral-50 px-2 py-1.5 text-center text-[11px] text-neutral-600">
              Top sản phẩm bán chạy nhất
            </li>
          </ul>
        )}
      </div>

      <ProductQuickViewDialog
        slug={slug}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
      />
    </div>
  );
}
