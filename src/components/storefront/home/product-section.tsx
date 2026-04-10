import Link from "next/link";
import type { ProductCardData } from "@/types";
import { ProductGrid } from "@/components/storefront/product/product-grid";

interface ProductSectionProps {
  title: string;
  viewAllLink: string;
  viewAllText?: string;
  products: ProductCardData[];
  columns?: 4 | 5;
}

export function ProductSection({
  title,
  viewAllLink,
  viewAllText = "Xem tất cả »",
  products,
  columns = 5,
}: ProductSectionProps) {
  if (products.length === 0) return null;

  return (
    <section
      className="section_collection_group pt-7 lg:pt-8"
      data-include="section-collection-group"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-neutral-100 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
          <div className="wd-top-title mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="title-section m-0 font-heading text-xl font-bold text-neutral-900 sm:text-2xl">
              <span className="text-neutral-400">|</span>{" "}
              {title}
            </h2>
            <ul
              className="menu-col hidden min-h-0 flex-wrap gap-2 md:flex"
              aria-hidden
            />
          </div>

          <ProductGrid products={products} columns={columns} />

          <div className="btn-view-all-tab mt-8 text-center">
            <Link
              href={viewAllLink}
              className="btn btn-all-tab inline-flex min-h-11 min-w-[200px] items-center justify-center rounded-lg bg-[#0066FF] px-8 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#0052cc]"
            >
              {viewAllText}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
