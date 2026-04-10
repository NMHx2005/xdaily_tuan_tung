import Image from "next/image";
import Link from "next/link";

export type HomeCategoryStripItem = {
  slug: string;
  href: string;
  label: string;
  imageUrl: string;
};

export function HomeCategoryStrip({ items }: { items: HomeCategoryStripItem[] }) {
  if (items.length === 0) return null;

  return (
    <section
      id="section-category"
      className="pt-6 md:pt-7"
      data-include="section-category"
    >
      <div className="rounded-xl border border-neutral-100/90 bg-white p-3 shadow-sm sm:p-4">
        <div
          className="category-banner flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-4 md:justify-center md:overflow-x-visible md:flex-wrap md:pb-0 [&::-webkit-scrollbar]:hidden"
          role="list"
        >
          {items.map((item) => (
            <div
              key={item.slug}
              className="banner-hover w-[100px] shrink-0 sm:w-[110px]"
              role="listitem"
            >
              <div className="box-cat flex flex-col items-center text-center">
                <Link
                  href={item.href}
                  className="img-cat relative block size-[100px] overflow-hidden rounded-full bg-neutral-100 ring-1 ring-neutral-100 transition-transform duration-200 hover:scale-105 hover:ring-[#0066FF]/30 sm:size-[110px]"
                >
                  <Image
                    src={item.imageUrl}
                    alt={item.label}
                    fill
                    sizes="110px"
                    className="object-cover"
                  />
                </Link>
                <div className="banner-content mt-2 px-0.5">
                  <Link
                    href={item.href}
                    className="text-xs font-medium leading-snug text-neutral-800 transition-colors hover:text-[#0066FF] sm:text-[13px]"
                  >
                    {item.label}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
