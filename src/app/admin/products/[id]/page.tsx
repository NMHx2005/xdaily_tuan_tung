import Link from "next/link";
import { notFound } from "next/navigation";

import { createCaller } from "@/lib/trpc/server";
import { ProductForm } from "@/components/admin/product-form";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const trpc = await createCaller();
  try {
    const product = await trpc.product.getById({ id });
    return { title: `Sửa: ${product.name}` };
  } catch {
    return { title: "Sản phẩm" };
  }
}

export default async function AdminEditProductPage({ params }: PageProps) {
  const { id } = await params;
  const trpc = await createCaller();
  const product = await trpc.product.getById({ id }).catch(() => null);
  if (!product) {
    notFound();
  }

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
        <span className="text-foreground">Chỉnh sửa</span>
      </nav>
      <h1 className="font-heading text-2xl font-bold">
        Chỉnh sửa: {product.name}
      </h1>
      <ProductForm mode="edit" initialData={product} />
    </div>
  );
}
