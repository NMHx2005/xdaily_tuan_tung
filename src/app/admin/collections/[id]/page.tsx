import Link from "next/link";
import { notFound } from "next/navigation";

import { createCaller } from "@/lib/trpc/server";
import { CollectionEditClient } from "@/components/admin/collections/collection-edit-client";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const trpc = await createCaller();
  const c = await trpc.collection.getById({ id }).catch(() => null);
  if (!c) return { title: "Bộ sưu tập" };
  return { title: c.name };
}

export default async function AdminCollectionEditPage({ params }: PageProps) {
  const { id } = await params;
  const trpc = await createCaller();
  const collection = await trpc.collection.getById({ id }).catch(() => null);
  if (!collection) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap gap-1 text-sm text-muted-foreground">
        <Link href="/admin" className="hover:text-foreground">
          Dashboard
        </Link>
        <span>/</span>
        <Link href="/admin/collections" className="hover:text-foreground">
          Bộ sưu tập
        </Link>
        <span>/</span>
        <span className="text-foreground">Chỉnh sửa</span>
      </nav>
      <h1 className="font-heading text-2xl font-bold">{collection.name}</h1>
      <CollectionEditClient initial={collection} />
    </div>
  );
}
