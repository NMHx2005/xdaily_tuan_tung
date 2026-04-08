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
  columns = 4,
}: ProductSectionProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-heading text-2xl font-bold lg:text-3xl">{title}</h2>
          <Link
            href={viewAllLink}
            className="text-sm text-gold transition-colors hover:underline"
          >
            {viewAllText}
          </Link>
        </div>
        <ProductGrid products={products} columns={columns} />
      </div>
    </section>
  );
}
