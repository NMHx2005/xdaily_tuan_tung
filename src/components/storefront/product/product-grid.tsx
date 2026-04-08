import type { ProductCardData } from "@/types";
import { ProductCard } from "./product-card";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  products: ProductCardData[];
  columns?: 4 | 5;
}

export function ProductGrid({ products, columns = 4 }: ProductGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
        columns === 5 && "xl:grid-cols-5"
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  );
}
