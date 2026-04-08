"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { COLLECTIONS } from "@/lib/constants";

export function NavMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="hidden lg:flex items-center gap-1">
      <Link
        href="/"
        className="px-3 py-2 text-sm font-medium transition-colors hover:text-gold"
      >
        Trang chủ
      </Link>

      <div
        className="relative"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors hover:text-gold">
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
                {COLLECTIONS.map((collection) => (
                  <Link
                    key={collection.slug}
                    href={`/collections/${collection.slug}`}
                    className="rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted hover:text-gold"
                    onClick={() => setIsOpen(false)}
                  >
                    {collection.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <Link
        href="/blogs"
        className="px-3 py-2 text-sm font-medium transition-colors hover:text-gold"
      >
        Tin tức
      </Link>
      <Link
        href="/about"
        className="px-3 py-2 text-sm font-medium transition-colors hover:text-gold"
      >
        Giới thiệu
      </Link>
    </nav>
  );
}
