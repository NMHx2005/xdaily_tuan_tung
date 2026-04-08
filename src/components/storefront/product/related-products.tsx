import type { ProductCardData } from "@/types";
import { ProductGrid } from "./product-grid";

interface RelatedProductsProps {
  products: ProductCardData[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="mb-6 font-heading text-xl font-bold">
        Sản phẩm liên quan
      </h2>
      <ProductGrid products={products} columns={4} />
    </section>
  );
}
