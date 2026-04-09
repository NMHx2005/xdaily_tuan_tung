"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { useDebounce } from "@/hooks/use-debounce";
import { trpc } from "@/lib/trpc/client";
import { formatPrice } from "@/lib/utils";

export function SearchBar() {
  const isSearchOpen = useUIStore((s) => s.isSearchOpen);
  const closeSearch = useUIStore((s) => s.closeSearch);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const clearAndClose = useCallback(() => {
    setQuery("");
    closeSearch();
  }, [closeSearch]);

  const { data, isFetching } = trpc.search.global.useQuery(
    { query: debouncedQuery },
    { enabled: debouncedQuery.length >= 2 }
  );

  const products = data?.products?.slice(0, 5) ?? [];
  const blogs = data?.blogs?.slice(0, 3) ?? [];
  const hasResults = products.length > 0 || blogs.length > 0;
  const showDropdown = debouncedQuery.length >= 2 && (hasResults || isFetching);

  useEffect(() => {
    if (isSearchOpen) {
      inputRef.current?.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") clearAndClose();
    }
    if (isSearchOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isSearchOpen, clearAndClose]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      clearAndClose();
    }
  }

  function handleNavigate(href: string) {
    clearAndClose();
    router.push(href);
  }

  if (!isSearchOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={clearAndClose}
      />
      <div className="absolute left-0 right-0 top-full z-50 border-b bg-background shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full rounded-lg border bg-background py-3 pl-12 pr-12 text-base outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
            />
            <button
              type="button"
              onClick={clearAndClose}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </form>

          {showDropdown && (
            <div className="mt-3 max-h-[60vh] overflow-y-auto rounded-lg border bg-background shadow-sm">
              {isFetching && !hasResults ? (
                <div className="p-4 text-center text-sm text-neutral-400">
                  Đang tìm kiếm...
                </div>
              ) : (
                <>
                  {products.length > 0 && (
                    <div>
                      <p className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                        Sản phẩm
                      </p>
                      {products.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleNavigate(`/products/${p.slug}`)}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-neutral-50"
                        >
                          <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-neutral-100">
                            {p.thumbnail && (
                              <Image
                                src={p.thumbnail}
                                alt={p.name}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">
                              {p.name}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {formatPrice(p.price)}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {blogs.length > 0 && (
                    <div className={products.length > 0 ? "border-t" : ""}>
                      <p className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                        Bài viết
                      </p>
                      {blogs.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => handleNavigate(`/blogs/${b.slug}`)}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-neutral-50"
                        >
                          {b.thumbnail && (
                            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-neutral-100">
                              <Image
                                src={b.thumbnail}
                                alt={b.title}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            </div>
                          )}
                          <p className="min-w-0 flex-1 text-sm font-medium truncate">
                            {b.title}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}

                  <Link
                    href={`/search?q=${encodeURIComponent(debouncedQuery)}`}
                    onClick={() => clearAndClose()}
                    className="block border-t px-4 py-3 text-center text-sm font-medium text-primary transition-colors hover:bg-neutral-50"
                  >
                    Xem tất cả kết quả cho &ldquo;{debouncedQuery}&rdquo;
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
