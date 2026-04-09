import Link from "next/link";

import { BlogEditor } from "@/components/admin/blogs/blog-editor";

export const metadata = { title: "Thêm bài viết" };

export default function AdminNewBlogPage() {
  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap gap-1 text-sm text-muted-foreground">
        <Link href="/admin" className="hover:text-foreground">
          Dashboard
        </Link>
        <span>/</span>
        <Link href="/admin/blogs" className="hover:text-foreground">
          Bài viết
        </Link>
        <span>/</span>
        <span className="text-foreground">Thêm mới</span>
      </nav>
      <h1 className="font-heading text-2xl font-bold">Thêm bài viết</h1>
      <BlogEditor mode="create" />
    </div>
  );
}
