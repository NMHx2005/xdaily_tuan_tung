"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { COLLECTIONS } from "@/lib/constants";

export function NavMenu() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
      <Link
        href="/"
        className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Trang chủ
      </Link>

      <div
        className="relative"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <button
          type="button"
          aria-expanded={isOpen}
          aria-haspopup="true"
          className="flex min-h-11 items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Sản phẩm
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <div className="absolute left-1/2 top-full -translate-x-1/2 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="w-[480px] rounded-lg border bg-background p-6 shadow-lg">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Danh mục sản phẩm
              </p>
              <div className="grid grid-cols-3 gap-1">
                {COLLECTIONS.map((collection) => {
                  const href = `/collections/${collection.slug}`;
                  return (
                    <Link
                      key={collection.slug}
                      href={href}
                      className="rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted hover:text-gold"
                      onClick={() => setIsOpen(false)}
                      onMouseEnter={() => router.prefetch(href)}
                    >
                      {collection.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <Link
        href="/blogs"
        className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Tin tức
      </Link>
      <Link
        href="/about"
        className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Giới thiệu
      </Link>
      <Link
        href="/contact"
        className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Liên hệ
      </Link>
    </nav>
  );
}
