import Link from "next/link";

import { CollectionCreateClient } from "@/components/admin/collections/collection-create-client";

export const metadata = { title: "Thêm bộ sưu tập" };

export default function AdminNewCollectionPage() {
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
        <span className="text-foreground">Thêm mới</span>
      </nav>
      <h1 className="font-heading text-2xl font-bold">Thêm bộ sưu tập</h1>
      <CollectionCreateClient />
    </div>
  );
}
