import Link from "next/link";

import { ProductsListClient } from "@/components/admin/products/products-list-client";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Sản phẩm",
};

export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-bold">Sản phẩm</h1>
        <Link href="/admin/products/new">
          <Button type="button">Thêm sản phẩm</Button>
        </Link>
      </div>
      <ProductsListClient />
    </div>
  );
}
