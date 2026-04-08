import Link from "next/link";

import { CollectionsListClient } from "@/components/admin/collections/collections-list-client";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Bộ sưu tập" };

export default function AdminCollectionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-bold">Bộ sưu tập</h1>
        <Link href="/admin/collections/new">
          <Button type="button">Thêm bộ sưu tập</Button>
        </Link>
      </div>
      <CollectionsListClient />
    </div>
  );
}
