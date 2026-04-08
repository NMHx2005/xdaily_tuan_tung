import type { Metadata } from "next";
import { createCaller } from "@/lib/trpc/server";
import { Breadcrumbs } from "@/components/storefront/collection/breadcrumbs";
import { BlogCard } from "@/components/storefront/blog/blog-card";
import { Pagination } from "@/components/storefront/collection/pagination";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Tin tức",
  description:
    "Tin tức mới nhất về nội thất, xu hướng thiết kế và mẹo trang trí từ XDAILY.",
  openGraph: {
    title: "Tin tức | XDAILY",
    description:
      "Tin tức mới nhất về nội thất, xu hướng thiết kế và mẹo trang trí.",
  },
};

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function BlogsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);

  const trpc = await createCaller();
  const { items, total, totalPages } = await trpc.blog.getAll({
    page,
    limit: 12,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <Breadcrumbs
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Tin tức" },
        ]}
      />

      <div className="mt-4">
        <h1 className="font-heading text-2xl font-bold sm:text-3xl">
          Tin tức
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          {total} bài viết
        </p>
      </div>

      {items.length === 0 ? (
        <div className="py-20 text-center text-neutral-400">
          Chưa có bài viết nào.
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((post) => (
              <BlogCard
                key={post.id}
                slug={post.slug}
                title={post.title}
                excerpt={post.excerpt}
                thumbnail={post.thumbnail}
                author={post.author}
                publishedAt={post.publishedAt}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-10">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                baseUrl="/blogs"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
