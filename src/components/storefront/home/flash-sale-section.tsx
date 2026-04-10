"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProductCardData } from "@/types";
import { cn } from "@/lib/utils";
import {
  FlashSaleProductCard,
  type FlashSaleCardExtras,
} from "@/components/storefront/home/flash-sale-product-card";

const FLASH_TITLE_BADGE_IMG =
  "https://file.hstatic.net/200000713019/file/flashsale-hot_6f59fac9870c4452bbed862ad7020f15.webp";

interface FlashSaleData {
  id: string;
  name: string;
  endsAt: Date;
  items: {
    id: string;
    salePrice: number;
    product: {
      id: string;
      slug: string;
      name: string;
      price: number;
      images: { url: string; alt: string }[];
      variants: { colorHex: string }[];
      badge: string | null;
    };
  }[];
}

interface FlashSaleSectionProps {
  flashSale: FlashSaleData;
}

function toProductCard(
  item: FlashSaleData["items"][number],
): ProductCardData {
  return {
    id: item.product.id,
    slug: item.product.slug,
    name: item.product.name,
    price: item.salePrice,
    compareAtPrice: item.product.price,
    thumbnail: item.product.images[0]?.url ?? "/placeholder.png",
    hoverImage: item.product.images[1]?.url ?? null,
    variantCount: item.product.variants.length,
    variantColors: item.product.variants.map((v) => v.colorHex).filter(Boolean),
    badge: (item.product.badge as ProductCardData["badge"]) ?? null,
  };
}

/** Gợi ý tiến độ bán (demo) — ổn định theo id */
function flashExtras(productId: string, index: number): FlashSaleCardExtras {
  let h = 0;
  const s = `${productId}-${index}`;
  for (let i = 0; i < s.length; i++) {
    h = (h * 33 + s.charCodeAt(i)) >>> 0;
  }
  const percent = 28 + (h % 68);
  const sold = 8 + (h % 42);
  const almostGone = percent >= 88;
  return {
    progressPercent: Math.min(95, percent),
    soldLabel: almostGone ? "Sắp cháy hàng" : `Đã bán ${sold} sản phẩm`,
    discountPercent: null,
  };
}

function discountPercent(price: number, compare: number | null): number | null {
  if (compare == null || compare <= price) return null;
  return Math.max(1, Math.round((1 - price / compare) * 100));
}

function FlashMarquee({ names }: { names: string[] }) {
  if (names.length === 0) return null;
  const doubled = [...names, ...names];
  return (
    <div
      className="relative min-h-[2rem] min-w-0 overflow-hidden lg:mx-2"
      aria-hidden
    >
      <ul className="animate-flash-marquee flex w-max gap-8 whitespace-nowrap py-1">
        {doubled.map((label, i) => (
          <li key={`${label}-${i}`} className="inline shrink-0">
            <span className="text-sm text-neutral-600">{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FlashCountdown({ endsAt }: { endsAt: Date }) {
  function calc(end: Date) {
    const diff = end.getTime() - Date.now();
    if (diff <= 0) return null;
    return {
      d: Math.floor(diff / (1000 * 60 * 60 * 24)),
      h: Math.floor((diff / (1000 * 60 * 60)) % 24),
      m: Math.floor((diff / (1000 * 60)) % 60),
      s: Math.floor((diff / 1000) % 60),
    };
  }

  /** Tránh lệch hydration: không dùng Date.now() trên SSR/lần render đầu. */
  const [parts, setParts] = useState<{
    d: number;
    h: number;
    m: number;
    s: number;
  } | null | "pending">("pending");

  useEffect(() => {
    const end = new Date(endsAt);
    const tick = () => {
      setParts(calc(end));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (parts === "pending") {
    const placeholder = [
      { label: "Ngày", value: "00" },
      { label: "Giờ", value: "00" },
      { label: "Phút", value: "00" },
      { label: "Giây", value: "00" },
    ];
    return (
      <ul
        className="countdown-deal flex shrink-0 items-center justify-center gap-1.5 sm:gap-2"
        aria-label="Thời gian còn lại"
        aria-busy="true"
      >
        {placeholder.map(({ label, value }) => (
          <li
            key={label}
            className="flex min-w-[2.5rem] flex-col items-center rounded-md border border-[#0066FF]/20 bg-white px-1.5 py-1 shadow-sm sm:min-w-[3rem] sm:px-2"
          >
            <strong className="text-sm tabular-nums text-neutral-300 sm:text-base">
              {value}
            </strong>
            <small className="text-[10px] leading-none text-neutral-500">
              {label}
            </small>
          </li>
        ))}
      </ul>
    );
  }

  if (!parts) {
    return (
      <span className="text-sm font-medium text-neutral-500">Đã kết thúc</span>
    );
  }

  const units = [
    { label: "Ngày", value: parts.d },
    { label: "Giờ", value: parts.h },
    { label: "Phút", value: parts.m },
    { label: "Giây", value: parts.s },
  ];

  return (
    <ul
      className="countdown-deal flex shrink-0 items-center justify-center gap-1.5 sm:gap-2"
      aria-label="Thời gian còn lại"
    >
      {units.map(({ label, value }) => (
        <li
          key={label}
          className="flex min-w-[2.5rem] flex-col items-center rounded-md border border-[#0066FF]/20 bg-white px-1.5 py-1 shadow-sm sm:min-w-[3rem] sm:px-2"
        >
          <strong className="text-sm tabular-nums text-neutral-900 sm:text-base">
            {String(value).padStart(2, "0")}
          </strong>
          <small className="text-[10px] leading-none text-neutral-500">
            {label}
          </small>
        </li>
      ))}
    </ul>
  );
}

export function FlashSaleSection({ flashSale }: FlashSaleSectionProps) {
  const products: ProductCardData[] = flashSale.items.map(toProductCard);
  const itemsWithExtras = products.map((p, i) => {
    const base = flashExtras(p.id, i);
    const disc = discountPercent(p.price, p.compareAtPrice);
    return {
      product: p,
      extras: { ...base, discountPercent: disc },
    };
  });

  const marqueeNames = products.map((p) => p.name);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: products.length > 5,
    skipSnaps: false,
  });
  const [selected, setSelected] = useState(0);
  const [snapCount, setSnapCount] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    const onReInit = () => setSnapCount(emblaApi.scrollSnapList().length);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onReInit);
    onSelect();
    onReInit();
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onReInit);
    };
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (products.length === 0) return null;

  const titleText = flashSale.name?.trim() || "Sản phẩm khuyến mãi";

  return (
    <section
      id="section-flash-sale"
      className="pt-7 lg:pt-8"
      data-include="section-flash-sale"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            "rounded-2xl border border-blue-100/90 bg-linear-to-br from-sky-50/80 via-white to-blue-50/40",
            "p-4 shadow-sm sm:p-5 lg:p-6",
          )}
        >
          <div className="wd-top-title grid gap-4 lg:grid-cols-[minmax(0,auto)_minmax(0,1fr)_auto] lg:items-center lg:gap-5">
            <h2 className="title-section m-0 font-heading text-lg font-bold text-neutral-900 sm:text-xl">
              <span className="inline-flex items-center gap-2">
                <Image
                  src={FLASH_TITLE_BADGE_IMG}
                  alt=""
                  width={30}
                  height={13}
                  className="shrink-0 object-contain"
                  unoptimized
                />
                {titleText}
              </span>
            </h2>

            <FlashMarquee names={marqueeNames} />

            <div className="flex justify-center lg:justify-end">
              <FlashCountdown endsAt={flashSale.endsAt} />
            </div>
          </div>

          <div className="relative mt-4 px-0 lg:mt-5 lg:px-9">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex -ml-3">
                {itemsWithExtras.map(({ product, extras }) => (
                  <div
                    key={product.id}
                    className="min-w-0 shrink-0 grow-0 basis-1/2 pl-3 sm:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                  >
                    <FlashSaleProductCard product={product} extras={extras} />
                  </div>
                ))}
              </div>
            </div>

            {products.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={scrollPrev}
                  className="absolute left-0 top-1/2 z-1 hidden h-9 w-9 -translate-x-1 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-md transition-colors hover:bg-neutral-50 lg:flex"
                  aria-label="Slide trước"
                >
                  <ChevronLeft className="h-5 w-5 text-neutral-700" />
                </button>
                <button
                  type="button"
                  onClick={scrollNext}
                  className="absolute right-0 top-1/2 z-1 hidden h-9 w-9 -translate-y-1/2 translate-x-1 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-md transition-colors hover:bg-neutral-50 lg:flex"
                  aria-label="Slide sau"
                >
                  <ChevronRight className="h-5 w-5 text-neutral-700" />
                </button>

                {snapCount > 1 && (
                  <ul
                    className="mt-4 flex justify-center gap-2"
                    role="tablist"
                    aria-label="Trang carousel"
                  >
                    {Array.from({ length: snapCount }, (_, i) => (
                      <li key={i} role="presentation">
                        <button
                          type="button"
                          role="tab"
                          aria-selected={selected === i}
                          className={cn(
                            "h-2 w-2 rounded-full transition-colors",
                            selected === i
                              ? "bg-[#0066FF]"
                              : "bg-neutral-300 hover:bg-neutral-400",
                          )}
                          onClick={() => emblaApi?.scrollTo(i)}
                          aria-label={`Trang ${i + 1}`}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/collections/ghe-an"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-neutral-300 bg-white px-6 text-sm font-medium text-neutral-800 transition-colors hover:border-[#0066FF] hover:text-[#0066FF]"
            >
              Xem tất cả »
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
