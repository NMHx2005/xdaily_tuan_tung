"use client";

import * as React from "react";
import Image from "next/image";
import { Search, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import type { ProductCardData } from "@/types";
import { TINY_BLUR_DATA_URL } from "@/lib/blur-placeholder";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { useUIStore } from "@/stores/ui-store";
import { ViewportPrefetchLink } from "@/components/storefront/viewport-prefetch-link";
import { cn } from "@/lib/utils";
import { ProductQuickViewDialog } from "@/components/storefront/product/product-quick-view-dialog";

const FLASH_BADGE_IMG =
  "https://file.hstatic.net/200000713019/file/flash-sale_a881187085374b689b2dff6b34de3083.png";

export type FlashSaleCardExtras = {
  progressPercent: number;
  soldLabel: string;
  discountPercent: number | null;
};

export function FlashSaleProductCard({
  product,
  extras,
}: {
  product: ProductCardData;
  extras: FlashSaleCardExtras;
}) {
  const {
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
  } = product;
  const { addItem } = useCart();
  const openCartDrawer = useUIStore((s) => s.openCartDrawer);
  const [quickViewOpen, setQuickViewOpen] = React.useState(false);

  const isOnSale = compareAtPrice !== null && compareAtPrice > price;

  const productHref = `/products/${slug}`;

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
    <div className="product-block item group">
      <div className="product-img relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
        <ViewportPrefetchLink
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
        </ViewportPrefetchLink>

        {extras.discountPercent !== null && extras.discountPercent > 0 && (
          <span className="pointer-events-none absolute left-2 top-2 z-5 rounded bg-sale px-2 py-0.5 text-xs font-bold text-white shadow-sm">
            -{extras.discountPercent}%
          </span>
        )}

        {badge && (
          <span
            className={cn(
              "pointer-events-none absolute right-2 top-2 z-5 max-w-[min(100%,11rem)] rounded px-2 py-1 text-[10px] font-semibold leading-tight text-white sm:text-xs",
              badge === "bestseller" ? "bg-sale" : "bg-emerald-600",
            )}
          >
            {badge === "bestseller"
              ? "Top sản phẩm bán chạy nhất"
              : "Mẫu mới vừa ra mắt"}
          </span>
        )}

        <button
          type="button"
          onClick={handleAddToCart}
          className={cn(
            "group/atc absolute bottom-2 right-2 z-20 flex h-10 max-w-10 items-center justify-end overflow-hidden rounded-full bg-[#e53935] shadow-md transition-[max-width] duration-300 ease-out",
            "hover:max-w-[min(260px,calc(100vw-2rem))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-100",
          )}
          aria-label={`Thêm ${name} vào giỏ`}
        >
          <span className="min-w-0 shrink whitespace-nowrap py-2 pl-3 text-left text-sm font-medium text-white opacity-0 transition-opacity duration-200 group-hover/atc:opacity-100">
            Thêm vào giỏ
          </span>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">
            <ShoppingBag className="h-5 w-5 text-[#e53935]" strokeWidth={2} aria-hidden />
          </span>
        </button>

        <div
          className={cn(
            "pointer-events-none absolute inset-0 z-10 hidden opacity-0 transition-opacity duration-200 lg:block",
            "lg:group-hover:opacity-100",
          )}
        >
          <div className="pointer-events-none absolute inset-0 bg-black/10" aria-hidden />
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

      <h3 className="pro-name mt-2.5 text-sm font-medium leading-snug text-neutral-900">
        <ViewportPrefetchLink
          href={productHref}
          className="line-clamp-2 hover:text-[#0066FF]"
        >
          {name}
        </ViewportPrefetchLink>
      </h3>

      {variantCount > 0 && variantColors.length > 0 && (
        <p className="mt-1 text-xs text-neutral-500">+{variantCount} màu sắc</p>
      )}

      <div className="mt-1.5 flex flex-wrap items-baseline gap-2">
        <span
          className={cn(
            "text-base font-bold",
            isOnSale ? "text-sale" : "text-neutral-900",
          )}
        >
          {formatPrice(price)}
        </span>
        {isOnSale && (
          <del className="text-sm text-neutral-400">
            {formatPrice(compareAtPrice!)}
          </del>
        )}
      </div>

      <div className="mt-3 space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-neutral-700">
          <Image
            src={FLASH_BADGE_IMG}
            alt=""
            width={16}
            height={16}
            className="shrink-0"
            unoptimized
          />
          <span>{extras.soldLabel}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
          <div
            className="h-full rounded-full bg-linear-to-r from-[#60a5fa] to-[#0066FF] transition-[width] duration-500"
            style={{ width: `${extras.progressPercent}%` }}
          />
        </div>
      </div>

      <ProductQuickViewDialog
        slug={slug}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
      />
    </div>
  );
}
