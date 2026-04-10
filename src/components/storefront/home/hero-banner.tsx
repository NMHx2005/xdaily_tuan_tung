"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { TINY_BLUR_DATA_URL } from "@/lib/blur-placeholder";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BannerData {
  id: string;
  image: string;
  mobileImage: string | null;
  title: string;
  subtitle: string;
  link: string;
}

interface HeroBannerProps {
  banners: BannerData[];
}

export function HeroBanner({ banners }: HeroBannerProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true }),
  ]);

  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (banners.length === 0) {
    return (
      <section className="relative z-0 overflow-hidden bg-brand">
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
          aria-hidden
        >
          <span className="select-none whitespace-nowrap font-black text-white/[0.08] [font-size:clamp(2.5rem,10vw,6rem)]">
            XDAILY CATALOG
          </span>
        </div>
        <div className="relative z-10 mx-auto flex max-w-7xl items-center justify-center px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="text-center text-white">
            <h1 className="font-heading text-4xl font-bold lg:text-5xl">
              Nội thất cao cấp
            </h1>
            <p className="mt-4 text-lg text-white/85">
              Thiết kế hiện đại — Chất lượng quốc tế — Giá tốt nhất
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative z-0 overflow-hidden bg-brand">
      <div
        className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center overflow-hidden"
        aria-hidden
      >
        <span className="select-none whitespace-nowrap font-black text-white/[0.07] [font-size:clamp(2rem,9vw,5.5rem)]">
          XDAILY CATALOG
        </span>
      </div>

      <div className="relative z-[2]">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {banners.map((banner) => (
              <div key={banner.id} className="min-w-0 flex-[0_0_100%]">
                <SlideContent banner={banner} />
              </div>
            ))}
          </div>
        </div>

        {banners.length > 1 && (
          <>
            <button
              type="button"
              onClick={scrollPrev}
              className="absolute left-4 top-1/2 z-[3] hidden -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md hover:bg-white lg:block"
              aria-label="Slide trước"
            >
              <ChevronLeft className="h-5 w-5 text-neutral-800" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              className="absolute right-4 top-1/2 z-[3] hidden -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md hover:bg-white lg:block"
              aria-label="Slide tiếp"
            >
              <ChevronRight className="h-5 w-5 text-neutral-800" />
            </button>

            <div className="absolute bottom-4 left-1/2 z-[3] flex -translate-x-1/2 gap-2">
              {banners.map((b, i) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => emblaApi?.scrollTo(i)}
                  className={cnDot(i === selectedIndex)}
                  aria-label={`Đi tới slide ${i + 1}`}
                  aria-current={i === selectedIndex ? "true" : undefined}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function cnDot(active: boolean) {
  return active
    ? "h-2.5 w-2.5 rounded-full bg-white shadow ring-2 ring-white/80"
    : "h-2.5 w-2.5 rounded-full bg-white/45 shadow ring-1 ring-white/30 hover:bg-white/70";
}

function SlideContent({ banner }: { banner: BannerData }) {
  const hasText = banner.title || banner.subtitle;
  const inner = (
    <div className="relative h-[280px] sm:h-[380px] lg:h-[352px]">
      <Image
        src={banner.image}
        alt={banner.title || "XDAILY Banner"}
        fill
        priority
        loading="eager"
        placeholder="blur"
        blurDataURL={TINY_BLUR_DATA_URL}
        sizes="100vw"
        className="hidden object-cover object-center sm:block"
      />
      <Image
        src={banner.mobileImage || banner.image}
        alt={banner.title || "XDAILY Banner"}
        fill
        priority
        loading="eager"
        placeholder="blur"
        blurDataURL={TINY_BLUR_DATA_URL}
        sizes="100vw"
        className="object-cover object-center sm:hidden"
      />
      {hasText && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-10 lg:p-12">
            <div className="mx-auto max-w-7xl">
              {banner.title && (
                <h2 className="font-heading text-2xl font-bold sm:text-3xl lg:text-4xl">
                  {banner.title}
                </h2>
              )}
              {banner.subtitle && (
                <p className="mt-2 max-w-lg text-sm text-white/80 sm:text-base">
                  {banner.subtitle}
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );

  if (banner.link) {
    return <Link href={banner.link}>{inner}</Link>;
  }

  return inner;
}
