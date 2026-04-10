"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { SearchX } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { ProductGrid } from "@/components/storefront/product/product-grid";
import { BlogCard } from "@/components/storefront/blog/blog-card";
import { Breadcrumbs } from "@/components/storefront/collection/breadcrumbs";
import { EmptyState } from "@/components/ui/empty-state";

type Tab = "products" | "blogs";

export function SearchResultsClient() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const [activeTab, setActiveTab] = useState<Tab>("products");

  const { data, isLoading } = trpc.search.global.useQuery(
    { query: q },
    { enabled: q.length >= 1 }
  );

  const products = data?.products ?? [];
  const blogs = data?.blogs ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <Breadcrumbs
        items={[{ label: "Tìm kiếm", jsonLdHref: "/search" }]}
      />

      <h1 className="mt-4 font-heading text-2xl font-bold sm:text-3xl">
        Kết quả tìm kiếm cho &ldquo;{q}&rdquo;
      </h1>

      {isLoading ? (
        <div className="py-20 text-center text-neutral-400">
          Đang tìm kiếm...
        </div>
      ) : products.length === 0 && blogs.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Không tìm thấy"
          description={`Không có kết quả cho "${q}". Hãy thử từ khóa khác hoặc xem danh mục sản phẩm.`}
          actionLabel="Về trang chủ"
          actionHref="/"
        />
      ) : (
        <>
          <div className="mt-6 flex gap-4 border-b">
            <button
              type="button"
              onClick={() => setActiveTab("products")}
              className={cn(
                "pb-3 text-sm font-medium transition-colors",
                activeTab === "products"
                  ? "border-b-2 border-primary text-primary"
                  : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              Sản phẩm ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("blogs")}
              className={cn(
                "pb-3 text-sm font-medium transition-colors",
                activeTab === "blogs"
                  ? "border-b-2 border-primary text-primary"
                  : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              Bài viết ({blogs.length})
            </button>
          </div>

          <div className="mt-6">
            {activeTab === "products" ? (
              products.length > 0 ? (
                <ProductGrid products={products} columns={4} />
              ) : (
                <EmptyState
                  icon={SearchX}
                  title="Không tìm thấy"
                  description="Không có sản phẩm phù hợp với từ khóa này."
                />
              )
            ) : blogs.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {blogs.map((b) => (
                  <BlogCard
                    key={b.id}
                    slug={b.slug}
                    title={b.title}
                    excerpt={b.excerpt}
                    thumbnail={b.thumbnail}
                    author={b.author}
                    publishedAt={b.publishedAt}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={SearchX}
                title="Không tìm thấy"
                description="Không có bài viết phù hợp với từ khóa này."
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
