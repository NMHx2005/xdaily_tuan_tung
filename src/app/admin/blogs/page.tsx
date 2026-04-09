import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BlogsListClient } from "@/components/admin/blogs/blogs-list-client";

export const metadata = { title: "Bài viết" };

export default function AdminBlogsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-bold">Bài viết</h1>
        <Link
          href="/admin/blogs/new"
          className={cn(buttonVariants({ variant: "default" }))}
        >
          Thêm bài viết
        </Link>
      </div>
      <BlogsListClient />
    </div>
  );
}
