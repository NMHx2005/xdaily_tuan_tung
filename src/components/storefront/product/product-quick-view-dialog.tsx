"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc/client";
import { TINY_BLUR_DATA_URL } from "@/lib/blur-placeholder";
import { cn, formatPrice } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { useUIStore } from "@/stores/ui-store";

type VariantRow = {
  id: string;
  name: string;
  colorHex: string;
  price: number;
  compareAtPrice: number | null;
  sku: string;
  inStock: boolean;
  image: string | null;
};

function normalizePath(u: string): string {
  let s = u.trim();
  if (s.startsWith("//")) s = `https:${s}`;
  if (!s.startsWith("http")) s = `https:${s}`;
  try {
    const { pathname } = new URL(s);
    return pathname.replace(/\/$/, "").toLowerCase();
  } catch {
    return s.toLowerCase().split("?")[0] ?? "";
  }
}

function fileStem(pathOrUrl: string): string {
  const seg = pathOrUrl.split("/").pop() ?? pathOrUrl;
  return seg.replace(/\.[a-z0-9]+$/i, "").replace(/_(grande|small|compact|thumb|medium|1024x1024)$/i, "");
}

/** Match variant featured image to gallery slide (Haravan slickGoTo behavior). */
function findGalleryIndexForVariant(
  gallery: { url: string }[],
  variantImage: string | null | undefined,
): number {
  if (!variantImage || gallery.length === 0) return -1;
  const vPath = normalizePath(variantImage);
  const vStem = fileStem(vPath);
  for (let i = 0; i < gallery.length; i++) {
    const pPath = normalizePath(gallery[i].url);
    if (pPath === vPath) return i;
    const gStem = fileStem(pPath);
    if (
      vStem.length > 4 &&
      gStem.length > 4 &&
      (gStem === vStem || gStem.includes(vStem) || vStem.includes(gStem))
    ) {
      return i;
    }
  }
  return -1;
}

export function ProductQuickViewDialog({
  slug,
  open,
  onOpenChange,
}: {
  slug: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { addItem } = useCart();
  const openCartDrawer = useUIStore((s) => s.openCartDrawer);

  const { data: product, isLoading, isError } = trpc.product.getBySlug.useQuery(
    { slug: slug! },
    { enabled: open && !!slug },
  );

  const [imgIndex, setImgIndex] = React.useState(0);
  const [selected, setSelected] = React.useState<VariantRow | null>(null);
  const [qty, setQty] = React.useState(1);

  const images = product?.images ?? [];

  const variants: VariantRow[] = React.useMemo(() => {
    if (!product?.variants) return [];
    return product.variants.map((v) => ({
      id: v.id,
      name: v.name,
      colorHex: v.colorHex,
      price: v.price,
      compareAtPrice: v.compareAtPrice,
      sku: v.sku,
      inStock: v.inStock,
      image: v.image,
    }));
  }, [product]);

  React.useEffect(() => {
    if (!open) {
      setImgIndex(0);
      setSelected(null);
      setQty(1);
    }
  }, [open]);

  React.useEffect(() => {
    if (!product) return;
    setQty(1);
    const vars = product.variants ?? [];
    const imgs = product.images ?? [];
    if (vars.length > 0) {
      const first = vars[0];
      setSelected({
        id: first.id,
        name: first.name,
        colorHex: first.colorHex,
        price: first.price,
        compareAtPrice: first.compareAtPrice,
        sku: first.sku,
        inStock: first.inStock,
        image: first.image,
      });
      const idx = findGalleryIndexForVariant(imgs, first.image);
      setImgIndex(idx >= 0 ? idx : 0);
    } else {
      setSelected(null);
      setImgIndex(0);
    }
  }, [product?.id]);

  const activePrice = selected?.price ?? product?.price ?? 0;
  const activeCompare = selected?.compareAtPrice ?? product?.compareAtPrice ?? null;
  const activeSku = selected?.sku ?? product?.sku ?? "";
  const inStock = selected
    ? selected.inStock
    : (product?.inStock ?? false);
  const maxQty =
    product?.stockQuantity && product.stockQuantity > 0
      ? product.stockQuantity
      : 99;

  const mainImageUrl = React.useMemo(() => {
    if (!product) return "/placeholder.png";
    if (images.length > 0) {
      const i = Math.min(Math.max(0, imgIndex), images.length - 1);
      return images[i]!.url;
    }
    return selected?.image ?? "/placeholder.png";
  }, [product, images, imgIndex, selected?.image]);

  const isOnSale =
    activePrice > 0 &&
    activeCompare !== null &&
    activeCompare > activePrice;
  const discountPct =
    isOnSale && activeCompare
      ? Math.max(1, Math.round((1 - activePrice / activeCompare) * 100))
      : null;

  function handleVariantPick(v: VariantRow) {
    setSelected(v);
    if (images.length > 0 && v.image) {
      const idx = findGalleryIndexForVariant(images, v.image);
      if (idx >= 0) setImgIndex(idx);
    }
  }

  function handleAddToCart() {
    if (!product || !inStock) return;
    addItem({
      productId: product.id,
      variantId: selected?.id ?? null,
      name: product.name,
      variantName: selected?.name ?? null,
      price: activePrice,
      image: mainImageUrl,
      slug: product.slug,
      maxStock: maxQty,
      quantity: qty,
    });
    toast.success(`Đã thêm ${product.name} vào giỏ hàng`);
    onOpenChange(false);
    openCartDrawer();
  }

  const galleryLen = images.length;
  const canPrev = galleryLen > 1 && imgIndex > 0;
  const canNext = galleryLen > 1 && imgIndex < galleryLen - 1;

  const prevImg = () => {
    if (canPrev) setImgIndex((i) => i - 1);
  };
  const nextImg = () => {
    if (canNext) setImgIndex((i) => i + 1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        overlayClassName="bg-black/45"
        className="max-h-[min(92vh,900px)] w-full max-w-[calc(100%-1.5rem)] gap-0 overflow-y-auto border-0 bg-white p-0 shadow-2xl sm:max-w-4xl"
      >
        <DialogTitle className="sr-only">
          {product?.name ?? "Xem nhanh sản phẩm"}
        </DialogTitle>

        {isLoading && (
          <div className="grid animate-pulse gap-0 md:grid-cols-2">
            <div className="aspect-360/460 bg-neutral-200 md:min-h-[min(60vh,460px)]" />
            <div className="space-y-4 p-6">
              <div className="h-8 bg-neutral-200" />
              <div className="h-4 w-1/2 bg-neutral-200" />
              <div className="h-10 bg-neutral-200" />
            </div>
          </div>
        )}

        {isError && (
          <div className="p-8 text-center text-sm text-neutral-600">
            Không tải được sản phẩm.
          </div>
        )}

        {product && !isLoading && (
          <div className="grid gap-0 md:grid-cols-2">
            {/* wrap-slider + slick-like arrows */}
            <div className="relative aspect-360/460 bg-neutral-100 md:min-h-[min(60vh,460px)]">
              <Image
                src={mainImageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                placeholder="blur"
                blurDataURL={TINY_BLUR_DATA_URL}
              />
              {discountPct !== null && (
                <span className="pro-sale-qv pointer-events-none absolute left-3 top-3 rounded bg-sale px-2 py-0.5 text-xs font-bold text-white">
                  <span>-{discountPct}%</span>
                </span>
              )}

              {galleryLen > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevImg}
                    disabled={!canPrev}
                    className={cn(
                      "absolute left-2 top-1/2 z-1 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-neutral-800 shadow-md transition-colors hover:bg-white",
                      !canPrev && "cursor-not-allowed opacity-40",
                    )}
                    aria-label="Ảnh trước"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={nextImg}
                    disabled={!canNext}
                    className={cn(
                      "absolute right-2 top-1/2 z-1 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-neutral-800 shadow-md transition-colors hover:bg-white",
                      !canNext && "cursor-not-allowed opacity-40",
                    )}
                    aria-label="Ảnh sau"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            <div
              id="product-detail-qv"
              className="flex flex-col gap-4 p-5 sm:p-6 md:max-h-[min(92vh,900px)] md:overflow-y-auto"
            >
              <div className="product-title space-y-2">
                <h2 className="font-heading text-xl font-bold leading-snug text-neutral-900 sm:text-2xl">
                  {product.name}
                </h2>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  <span id="pro_sku_qv" className="text-neutral-600">
                    <strong className="text-neutral-800">SKU: </strong>
                    {activeSku || "Đang cập nhật"}
                  </span>
                  <span
                    className={cn(
                      "pro-status rounded px-2 py-0.5 text-xs font-medium",
                      inStock
                        ? "green-status bg-emerald-100 text-emerald-800"
                        : "bg-neutral-200 text-neutral-600",
                    )}
                  >
                    {inStock ? "Còn hàng" : "Hết hàng"}
                  </span>
                </div>
              </div>

              <div id="price-qv" className="product-price flex flex-wrap items-baseline gap-2">
                {activePrice <= 0 ? (
                  <span className="pro-price-qv text-2xl font-bold text-neutral-900">
                    Liên hệ
                  </span>
                ) : (
                  <>
                    <span
                      className={cn(
                        "pro-price-qv text-2xl font-bold",
                        isOnSale ? "text-sale" : "text-neutral-900",
                      )}
                    >
                      {formatPrice(activePrice)}
                    </span>
                    {isOnSale && (
                      <del className="text-lg text-neutral-400">
                        {formatPrice(activeCompare!)}
                      </del>
                    )}
                  </>
                )}
              </div>

              {variants.length > 0 && (
                <div className="select-swatch">
                  <div className="header text-sm font-medium text-neutral-800">
                    Tiêu đề:{" "}
                    <span className="color-text font-normal text-neutral-600">
                      {selected?.name ?? "—"}
                    </span>
                  </div>
                  <div className="select-swap mt-2 flex flex-wrap gap-2">
                    {variants.map((v) => {
                      const active = selected?.id === v.id;
                      return (
                        <div key={v.id} className="swatch-element">
                          <button
                            type="button"
                            disabled={!v.inStock}
                            onClick={() => handleVariantPick(v)}
                            className={cn(
                              "relative min-h-10 min-w-18 rounded border-2 px-3 py-1.5 text-left text-sm font-medium transition-colors",
                              active
                                ? "sd border-[#0066FF] text-neutral-900 ring-1 ring-[#0066FF]/25"
                                : "border-neutral-200 text-neutral-700 hover:border-neutral-300",
                              !v.inStock && "cursor-not-allowed opacity-40",
                            )}
                          >
                            {active && (
                              <Check
                                className="img-check pointer-events-none absolute right-0.5 top-0.5 h-3.5 w-3.5 text-[#0066FF]"
                                strokeWidth={3}
                                aria-hidden
                              />
                            )}
                            <span>{v.name}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="quantity-area">
                <p className="text-sm font-medium text-neutral-700">Số lượng</p>
                <div className="mt-2 flex items-center">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    className="qty-btn qtyminus flex h-10 w-10 items-center justify-center rounded-l border border-r-0 border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-40"
                    aria-label="Giảm"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="quantity-selector flex h-10 min-w-10 items-center justify-center border border-neutral-200 text-sm tabular-nums">
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                    disabled={qty >= maxQty}
                    className="qty-btn qtyplus flex h-10 w-10 items-center justify-center rounded-r border border-l-0 border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-40"
                    aria-label="Tăng"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="wrap-addcart">
                <button
                  type="button"
                  id="add-to-cart-qv"
                  onClick={handleAddToCart}
                  disabled={!inStock || activePrice <= 0}
                  className={cn(
                    "add-to-cart-style-qv flex w-full items-start gap-3 rounded-md border border-black/10 bg-[#0066FF] px-4 py-3 text-left text-white shadow-sm",
                    "transition-colors hover:bg-[#0052cc] active:bg-[#0047b3]",
                    "disabled:cursor-not-allowed disabled:opacity-45",
                  )}
                >
                  <ShoppingBag
                    className="mt-0.5 size-5 shrink-0 opacity-95"
                    strokeWidth={2}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold leading-snug">
                      {inStock ? "Thêm vào giỏ" : "Hết hàng"}
                    </span>
                    <span className="mt-0.5 block text-[11px] font-normal leading-snug text-white/85">
                      Giao tận nơi hoặc nhận tại cửa hàng
                    </span>
                  </span>
                </button>
              </div>

              <Link
                href={`/products/${product.slug}`}
                onClick={() => onOpenChange(false)}
                className="view-detail mt-1 text-center text-sm font-medium text-[#0066FF] underline underline-offset-2 hover:text-[#0052cc]"
              >
                Xem chi tiết »
              </Link>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
