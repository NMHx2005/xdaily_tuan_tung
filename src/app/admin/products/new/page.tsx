import Link from "next/link";

import { ProductForm } from "@/components/admin/product-form";

export const metadata = {
  title: "Thêm sản phẩm",
};

export default function AdminNewProductPage() {
  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap gap-1 text-sm text-muted-foreground">
        <Link href="/admin" className="hover:text-foreground">
          Dashboard
        </Link>
        <span>/</span>
        <Link href="/admin/products" className="hover:text-foreground">
          Sản phẩm
        </Link>
        <span>/</span>
        <span className="text-foreground">Thêm mới</span>
      </nav>
      <h1 className="font-heading text-2xl font-bold">Thêm sản phẩm mới</h1>
      <ProductForm mode="create" />
    </div>
  );
}
