import Image from "next/image";
import Link from "next/link";
import { TINY_BLUR_DATA_URL } from "@/lib/blur-placeholder";

export interface HomeFourBannerItem {
  id: string;
  image: string;
  mobileImage: string | null;
  title: string;
  link: string;
}

interface HomeFourBannerSectionProps {
  banners: HomeFourBannerItem[];
}

/**
 * Bốn banner: desktop 4 cột; tablet 2 cột; mobile 2 cột (lưới 2×2, không flex cuộn —
 * tránh min-w-% trong flex làm width = 0 → aspect ratio sập, banner “mất” trên Safari/mobile).
 */
export function HomeFourBannerSection({ banners }: HomeFourBannerSectionProps) {
  if (banners.length === 0) return null;

  return (
    <section
      data-include="section-four-banner"
      id="section-four-banner"
      className="pt-6 sm:pt-8"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Cùng lề ngang với ProductSection (p-4 sm:p-5 lg:p-6) */}
        <div className="rounded-lg bg-white p-4 shadow-sm sm:p-5 lg:p-6 dark:bg-card">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {banners.map((b) => (
              <div key={b.id} className="min-w-0">
                <Link
                  href={b.link || "#"}
                  className="group block overflow-hidden rounded-md border border-neutral-100 bg-neutral-50 transition-shadow hover:shadow-md dark:border-border dark:bg-muted/30"
                >
                  {/*
                    Không dùng chỉ aspect-ratio + ảnh fill: trên WebKit/Safari ô có thể sập về h=0
                    vì ảnh absolute không tạo chiều cao khối. pb-[50%] (2:1) neo chiều cao theo width.
                  */}
                  <div className="relative h-0 w-full overflow-hidden pb-[50%]">
                    <Image
                      src={b.image}
                      alt={b.title || "Banner"}
                      fill
                      sizes="(max-width: 1023px) 50vw, 25vw"
                      className="hidden object-cover object-center sm:block"
                      placeholder="blur"
                      blurDataURL={TINY_BLUR_DATA_URL}
                    />
                    <Image
                      src={b.mobileImage || b.image}
                      alt={b.title || "Banner"}
                      fill
                      sizes="(max-width: 1023px) 50vw, 25vw"
                      className="object-cover object-center sm:hidden"
                      placeholder="blur"
                      blurDataURL={TINY_BLUR_DATA_URL}
                    />
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
