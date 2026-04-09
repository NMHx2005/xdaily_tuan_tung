import Link from "next/link";
import { notFound } from "next/navigation";

import { createCaller } from "@/lib/trpc/server";
import { BlogEditor } from "@/components/admin/blogs/blog-editor";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const trpc = await createCaller();
  try {
    const post = await trpc.blog.getById({ id });
    return { title: `Sửa: ${post.title}` };
  } catch {
    return { title: "Bài viết" };
  }
}

export default async function AdminEditBlogPage({ params }: PageProps) {
  const { id } = await params;
  const trpc = await createCaller();
  const post = await trpc.blog.getById({ id }).catch(() => null);
  if (!post) {
    notFound();
  }

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
        <span className="text-foreground">Chỉnh sửa</span>
      </nav>
      <h1 className="font-heading text-2xl font-bold">
        Chỉnh sửa: {post.title}
      </h1>
      <BlogEditor mode="edit" initialPost={post} />
    </div>
  );
}
